"""
Language & Style Rule Engine
LLM-based grammar, spelling, clarity, and style guide compliance
"""

from typing import List
import uuid
from datetime import datetime
import openai
import structlog

from app.models.deck import Deck
from app.models.asset import AssetGraph, AssetType
from app.models.issue import Issue, IssueSeverity, IssueCategory, IssueLocation
from app.models.operation import Operation, OperationType, OperationTarget, OperationChange, OperationStatus
from app.rule_engines.analyzer import EngineResult
from app.utils.config import settings

logger = structlog.get_logger()

# Initialize OpenAI
if settings.OPENAI_API_KEY:
    openai.api_key = settings.OPENAI_API_KEY


class LanguageEngine:
    """Language and style validation engine"""

    async def analyze(self, deck: Deck, asset_graph: AssetGraph) -> EngineResult:
        """Run language analysis"""
        start_time = datetime.utcnow()
        result = EngineResult()

        try:
            # Extract all text
            all_text = self._extract_all_text(asset_graph)

            # Run checks
            await self._check_spelling_grammar(deck, asset_graph, all_text, result)
            await self._check_style_guide(deck, asset_graph, all_text, result)
            await self._check_clarity(deck, asset_graph, all_text, result)

            result.execution_time = (datetime.utcnow() - start_time).total_seconds()
            return result

        except Exception as e:
            logger.error("language_engine_failed", error=str(e), exc_info=e)
            result.execution_time = (datetime.utcnow() - start_time).total_seconds()
            return result

    async def _check_spelling_grammar(
        self, deck: Deck, asset_graph: AssetGraph, text_map: dict, result: EngineResult
    ):
        """Check spelling and grammar using LLM"""
        if not settings.OPENAI_API_KEY:
            logger.warning("openai_key_not_set", check="spelling_grammar")
            return

        for (slide_num, shape_id), text in text_map.items():
            if not text or len(text.strip()) < 3:
                continue

            try:
                response = await openai.ChatCompletion.acreate(
                    model=settings.OPENAI_MODEL,
                    messages=[
                        {"role": "system", "content": "You are a professional editor checking for spelling and grammar errors. Return corrections in JSON format: [{\"error\": \"...\", \"suggestion\": \"...\", \"reason\": \"...\"}]. If no errors, return empty array."},
                        {"role": "user", "content": f"Check this text for errors:\n\n{text}"}
                    ],
                    temperature=0.3,
                    max_tokens=500
                )

                corrections = eval(response.choices[0].message.content)

                for correction in corrections:
                    issue_id = f"issue_{uuid.uuid4().hex[:12]}"
                    op_id = f"op_{uuid.uuid4().hex[:12]}"

                    issue = Issue(
                        id=issue_id,
                        deck_id=deck.id,
                        category=IssueCategory.LANGUAGE,
                        severity=IssueSeverity.MEDIUM,
                        title="Grammar/Spelling error",
                        description=correction["error"],
                        rationale=correction["reason"],
                        location=IssueLocation(
                            slide_number=slide_num,
                            shape_id=shape_id
                        ),
                        current_value=correction["error"],
                        suggested_value=correction["suggestion"],
                        rule_id="lang_001",
                        rule_name="grammar_spelling_check",
                        auto_fixable=True,
                        operation_id=op_id,
                        citations=["Grammar Guidelines"],
                        confidence=0.9
                    )

                    operation = Operation(
                        id=op_id,
                        deck_id=deck.id,
                        issue_id=issue_id,
                        type=OperationType.TEXT_REPLACE,
                        target=OperationTarget(
                            slide_number=slide_num,
                            shape_id=shape_id
                        ),
                        changes=[
                            OperationChange(
                                property="text",
                                before=correction["error"],
                                after=correction["suggestion"]
                            )
                        ],
                        rule_id="lang_001",
                        rule_name="grammar_spelling_fix",
                        category="language",
                        rationale=correction["reason"],
                        confidence=0.9,
                        status=OperationStatus.PENDING
                    )

                    result.issues.append(issue)
                    result.operations.append(operation)

            except Exception as e:
                logger.warning("grammar_check_failed", slide=slide_num, error=str(e))

    async def _check_style_guide(
        self, deck: Deck, asset_graph: AssetGraph, text_map: dict, result: EngineResult
    ):
        """Check style guide compliance"""
        # Common style rules
        for (slide_num, shape_id), text in text_map.items():
            # Check "and" vs "&"
            if " & " in text and settings.STYLE_GUIDE_DEFAULT == "microsoft":
                issue = Issue(
                    id=f"issue_{uuid.uuid4().hex[:12]}",
                    deck_id=deck.id,
                    category=IssueCategory.STYLE_GUIDE,
                    severity=IssueSeverity.LOW,
                    title="Use 'and' instead of '&'",
                    description="Microsoft Style Guide recommends spelling out 'and'",
                    rationale="Use '&' only in UI labels where space is limited",
                    location=IssueLocation(
                        slide_number=slide_num,
                        shape_id=shape_id
                    ),
                    current_value="Contains '&'",
                    suggested_value="Replace with 'and'",
                    rule_id="lang_002",
                    rule_name="and_vs_ampersand",
                    auto_fixable=True,
                    citations=["Microsoft Writing Style Guide"],
                    confidence=0.95
                )
                result.issues.append(issue)

            # Check for numbers that should be spelled out
            import re
            small_numbers = re.findall(r'\b([1-9])\b', text)
            if small_numbers:
                issue = Issue(
                    id=f"issue_{uuid.uuid4().hex[:12]}",
                    deck_id=deck.id,
                    category=IssueCategory.STYLE_GUIDE,
                    severity=IssueSeverity.LOW,
                    title="Spell out small numbers",
                    description="Numbers 1-9 should be spelled out in body text",
                    rationale="Per APA style, spell out numbers one through nine",
                    location=IssueLocation(
                        slide_number=slide_num,
                        shape_id=shape_id
                    ),
                    current_value=f"Found digits: {small_numbers}",
                    suggested_value="Spell out as words",
                    rule_id="lang_003",
                    rule_name="spell_out_numbers",
                    auto_fixable=True,
                    citations=["APA Style Guide - Numbers in Text"],
                    confidence=0.85
                )
                result.issues.append(issue)

    async def _check_clarity(
        self, deck: Deck, asset_graph: AssetGraph, text_map: dict, result: EngineResult
    ):
        """Check clarity and conciseness"""
        for (slide_num, shape_id), text in text_map.items():
            if len(text.split()) > 50:  # Long text block
                issue = Issue(
                    id=f"issue_{uuid.uuid4().hex[:12]}",
                    deck_id=deck.id,
                    category=IssueCategory.STYLE_GUIDE,
                    severity=IssueSeverity.LOW,
                    title="Text may be too verbose",
                    description=f"Text block contains {len(text.split())} words",
                    rationale="Presentation slides should be concise (typically <50 words per slide)",
                    location=IssueLocation(
                        slide_number=slide_num,
                        shape_id=shape_id
                    ),
                    current_value=f"{len(text.split())} words",
                    suggested_value="Consider condensing",
                    rule_id="lang_004",
                    rule_name="conciseness_check",
                    auto_fixable=False,
                    citations=["Presentation Best Practices"],
                    confidence=0.75
                )
                result.issues.append(issue)

    def _extract_all_text(self, asset_graph: AssetGraph) -> dict:
        """Extract all text content mapped to locations"""
        text_map = {}
        for slide_num, assets in asset_graph.slides.items():
            for asset in assets:
                if asset.text_content:
                    text_map[(slide_num, asset.shape_id)] = asset.text_content
        return text_map
