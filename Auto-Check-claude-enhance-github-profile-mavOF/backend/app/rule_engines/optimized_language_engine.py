"""
Optimized Language Engine
Performance-enhanced version with caching and batching
"""

from typing import List, Dict
import uuid
from datetime import datetime
import asyncio
import structlog

from app.models.deck import Deck
from app.models.asset import AssetGraph, AssetType
from app.models.issue import Issue, IssueSeverity, IssueCategory, IssueLocation
from app.models.operation import Operation, OperationType, OperationTarget, OperationChange, OperationStatus
from app.rule_engines.analyzer import EngineResult
from app.services.model_manager import model_manager
from app.models.model_config import ModelTask
from app.utils.cache import grammar_cache, cache_result, should_skip_check

logger = structlog.get_logger()


class OptimizedLanguageEngine:
    """
    Performance-optimized language validation engine

    Optimizations:
    - Caching of grammar checks
    - Skip short/irrelevant text
    - Parallel processing
    - Batching when possible
    """

    def __init__(self):
        self.use_cache = True
        self.min_text_length = 10  # Skip text shorter than this
        self.batch_size = 10

    async def analyze(self, deck: Deck, asset_graph: AssetGraph) -> EngineResult:
        """Run optimized language analysis"""
        start_time = datetime.utcnow()
        result = EngineResult()

        try:
            # Extract all text with filtering
            text_map = self._extract_and_filter_text(asset_graph)

            if not text_map:
                logger.info("no_text_to_analyze", deck_id=deck.id)
                result.execution_time = (datetime.utcnow() - start_time).total_seconds()
                return result

            logger.info(
                "language_analysis_start",
                deck_id=deck.id,
                text_blocks=len(text_map)
            )

            # Run checks in parallel for speed
            await asyncio.gather(
                self._check_spelling_grammar_optimized(deck, text_map, result),
                self._check_style_guide_fast(deck, text_map, result),
                self._check_clarity_fast(deck, text_map, result),
                return_exceptions=True
            )

            result.execution_time = (datetime.utcnow() - start_time).total_seconds()

            logger.info(
                "language_analysis_complete",
                deck_id=deck.id,
                issues=len(result.issues),
                time_s=result.execution_time
            )

            return result

        except Exception as e:
            logger.error("language_engine_failed", error=str(e), exc_info=e)
            result.execution_time = (datetime.utcnow() - start_time).total_seconds()
            return result

    def _extract_and_filter_text(self, asset_graph: AssetGraph) -> Dict:
        """Extract text and filter out short/irrelevant content"""
        text_map = {}

        for slide_num, assets in asset_graph.slides.items():
            for asset in assets:
                if not asset.text_content:
                    continue

                text = asset.text_content.strip()

                # Skip if should be filtered
                if should_skip_check(text, self.min_text_length):
                    continue

                key = (slide_num, asset.shape_id)
                text_map[key] = text

        return text_map

    @cache_result(grammar_cache, prefix="grammar")
    async def _check_single_text(self, text: str) -> List[Dict]:
        """Check single text block (cached)"""
        try:
            provider = model_manager.get_provider_for_task(ModelTask.GRAMMAR_CHECK)

            # Optimized prompt for speed
            system_prompt = "You are a grammar checker. Return ONLY a JSON array of corrections. If no errors, return empty array []."

            prompt = f"""Check this text for grammar/spelling errors. Return JSON only:

Text: {text[:500]}

Format: [{{"error": "...", "suggestion": "...", "reason": "..."}}]"""

            response = await provider.generate_text(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.1,
                max_tokens=300  # Reduced for speed
            )

            # Parse response
            try:
                # Extract JSON from response
                import json
                import re

                json_match = re.search(r'\[.*\]', response, re.DOTALL)
                if json_match:
                    corrections = json.loads(json_match.group())
                    return corrections if isinstance(corrections, list) else []
            except:
                pass

            return []

        except Exception as e:
            logger.warning("grammar_check_failed", error=str(e))
            return []

    async def _check_spelling_grammar_optimized(
        self, deck: Deck, text_map: dict, result: EngineResult
    ):
        """Optimized grammar checking with caching and batching"""
        # Process in parallel batches
        tasks = []
        locations = []

        for (slide_num, shape_id), text in text_map.items():
            tasks.append(self._check_single_text(text))
            locations.append((slide_num, shape_id, text))

        # Process all in parallel (much faster!)
        all_corrections = await asyncio.gather(*tasks, return_exceptions=True)

        # Create issues from corrections
        for idx, corrections in enumerate(all_corrections):
            if isinstance(corrections, Exception):
                continue

            if not corrections:
                continue

            slide_num, shape_id, text = locations[idx]

            for correction in corrections:
                if not isinstance(correction, dict):
                    continue

                issue_id = f"issue_{uuid.uuid4().hex[:12]}"
                op_id = f"op_{uuid.uuid4().hex[:12]}"

                issue = Issue(
                    id=issue_id,
                    deck_id=deck.id,
                    category=IssueCategory.LANGUAGE,
                    severity=IssueSeverity.MEDIUM,
                    title="Grammar/Spelling error",
                    description=correction.get("error", "Grammar issue"),
                    rationale=correction.get("reason", "Improve grammar"),
                    location=IssueLocation(
                        slide_number=slide_num,
                        shape_id=shape_id
                    ),
                    current_value=correction.get("error", ""),
                    suggested_value=correction.get("suggestion", ""),
                    rule_id="lang_001",
                    rule_name="grammar_spelling_check",
                    auto_fixable=True,
                    operation_id=op_id,
                    citations=["Grammar Guidelines"],
                    confidence=0.85
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
                            before=correction.get("error", ""),
                            after=correction.get("suggestion", "")
                        )
                    ],
                    rule_id="lang_001",
                    rule_name="grammar_spelling_fix",
                    category="language",
                    rationale=correction.get("reason", ""),
                    confidence=0.85,
                    status=OperationStatus.PENDING
                )

                result.issues.append(issue)
                result.operations.append(operation)

    async def _check_style_guide_fast(
        self, deck: Deck, text_map: dict, result: EngineResult
    ):
        """Fast style guide checking (rule-based, no AI)"""
        import re

        for (slide_num, shape_id), text in text_map.items():
            # Check "and" vs "&" (fast regex)
            if " & " in text:
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

            # Check for small numbers (fast regex)
            small_numbers = re.findall(r'\b([1-9])\b', text)
            if small_numbers and len(text) > 50:  # Only for longer text
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
                    current_value=f"Found digits: {small_numbers[:3]}",
                    suggested_value="Spell out as words",
                    rule_id="lang_003",
                    rule_name="spell_out_numbers",
                    auto_fixable=True,
                    citations=["APA Style Guide - Numbers in Text"],
                    confidence=0.80
                )
                result.issues.append(issue)

    async def _check_clarity_fast(
        self, deck: Deck, text_map: dict, result: EngineResult
    ):
        """Fast clarity checking (rule-based)"""
        for (slide_num, shape_id), text in text_map.items():
            word_count = len(text.split())

            # Check for overly verbose text
            if word_count > 75:  # Increased threshold
                issue = Issue(
                    id=f"issue_{uuid.uuid4().hex[:12]}",
                    deck_id=deck.id,
                    category=IssueCategory.STYLE_GUIDE,
                    severity=IssueSeverity.LOW,
                    title="Text may be too verbose",
                    description=f"Text block contains {word_count} words",
                    rationale="Presentation slides should be concise",
                    location=IssueLocation(
                        slide_number=slide_num,
                        shape_id=shape_id
                    ),
                    current_value=f"{word_count} words",
                    suggested_value="Consider condensing to <75 words",
                    rule_id="lang_004",
                    rule_name="conciseness_check",
                    auto_fixable=False,
                    citations=["Presentation Best Practices"],
                    confidence=0.70
                )
                result.issues.append(issue)
