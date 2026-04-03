"""
RAG Validation Engine
Fact-checking using retrieval-augmented generation
"""

from typing import List
import uuid
from datetime import datetime
import structlog

from app.models.deck import Deck
from app.models.asset import AssetGraph
from app.models.issue import Issue, IssueSeverity, IssueCategory, IssueLocation
from app.rule_engines.analyzer import EngineResult
from app.rag.service import rag_service

logger = structlog.get_logger()


class RAGValidationEngine:
    """RAG-based fact validation"""

    async def analyze(self, deck: Deck, asset_graph: AssetGraph) -> EngineResult:
        """Run RAG validation"""
        start_time = datetime.utcnow()
        result = EngineResult()

        try:
            # Extract claims
            claims = self._extract_claims(asset_graph)

            # Validate each claim
            for claim_data in claims:
                validation = await rag_service.validate_claim(
                    claim=claim_data["text"],
                    context=claim_data
                )

                if not validation.get("verified", True):
                    issue = Issue(
                        id=f"issue_{uuid.uuid4().hex[:12]}",
                        deck_id=deck.id,
                        category=IssueCategory.FACT_CHECK,
                        severity=IssueSeverity.HIGH,
                        title="Claim requires verification",
                        description=validation.get("message", "Could not verify claim"),
                        rationale=validation.get("rationale", "Fact-check against knowledge base"),
                        location=IssueLocation(
                            slide_number=claim_data["slide"],
                            shape_id=claim_data["shape_id"]
                        ),
                        current_value=claim_data["text"][:100],
                        suggested_value=validation.get("suggested_value"),
                        rule_id="rag_001",
                        rule_name="fact_check",
                        auto_fixable=False,
                        citations=validation.get("citations", []),
                        confidence=validation.get("confidence", 0.5)
                    )
                    result.issues.append(issue)

            result.execution_time = (datetime.utcnow() - start_time).total_seconds()
            return result

        except Exception as e:
            logger.error("rag_engine_failed", error=str(e), exc_info=e)
            result.execution_time = (datetime.utcnow() - start_time).total_seconds()
            return result

    def _extract_claims(self, asset_graph: AssetGraph) -> List[dict]:
        """Extract factual claims from text"""
        claims = []

        for slide_num, assets in asset_graph.slides.items():
            for asset in assets:
                if not asset.text_content:
                    continue

                # Simple heuristic: sentences with numbers or definitive statements
                sentences = asset.text_content.split(".")
                for sentence in sentences:
                    sentence = sentence.strip()
                    if len(sentence) > 20 and any(char.isdigit() for char in sentence):
                        claims.append({
                            "text": sentence,
                            "slide": slide_num,
                            "shape_id": asset.shape_id
                        })

        return claims
