"""
Deck Analyzer
Orchestrates all rule engines and produces comprehensive analysis
"""

from typing import List, Dict, Any
from datetime import datetime
import asyncio
import structlog

from app.models.deck import Deck
from app.models.issue import Issue
from app.models.operation import Operation
from app.models.asset import AssetGraph
from app.parsers.pptx_parser import PPTXParser
from app.parsers.pdf_parser import PDFParser
from app.rule_engines.formatting_engine import FormattingEngine
from app.rule_engines.language_engine import LanguageEngine
from app.rule_engines.numeric_engine import NumericEngine
from app.rule_engines.chart_engine import ChartEngine
from app.rule_engines.rag_engine import RAGValidationEngine

logger = structlog.get_logger()


class AnalysisResult:
    """Result of deck analysis"""
    def __init__(self):
        self.issues: List[Issue] = []
        self.operations: List[Operation] = []
        self.asset_graph: AssetGraph = None
        self.completed_at: datetime = None
        self.execution_times: Dict[str, float] = {}


class DeckAnalyzer:
    """Main analyzer that orchestrates all rule engines"""

    def __init__(self):
        self.formatting_engine = FormattingEngine()
        self.language_engine = LanguageEngine()
        self.numeric_engine = NumericEngine()
        self.chart_engine = ChartEngine()
        self.rag_engine = RAGValidationEngine()

    async def analyze(self, deck: Deck) -> AnalysisResult:
        """
        Run comprehensive analysis on deck

        Steps:
        1. Parse deck to asset graph
        2. Run deterministic rules (formatting, hierarchy)
        3. Run LLM-based rules (language, style)
        4. Run numeric validation
        5. Run chart integrity checks
        6. Run RAG fact-checking
        7. Aggregate results
        """
        result = AnalysisResult()
        start_time = datetime.utcnow()

        try:
            logger.info("analysis_started", deck_id=deck.id)

            # Step 1: Parse deck
            parse_start = datetime.utcnow()
            result.asset_graph = await self._parse_deck(deck)
            result.execution_times["parsing"] = (datetime.utcnow() - parse_start).total_seconds()

            logger.info(
                "deck_parsed",
                deck_id=deck.id,
                assets=result.asset_graph.total_assets
            )

            # Step 2: Run all rule engines in parallel
            engines = [
                ("formatting", self.formatting_engine.analyze(deck, result.asset_graph)),
                ("language", self.language_engine.analyze(deck, result.asset_graph)),
                ("numeric", self.numeric_engine.analyze(deck, result.asset_graph)),
                ("chart", self.chart_engine.analyze(deck, result.asset_graph)),
                ("rag", self.rag_engine.analyze(deck, result.asset_graph))
            ]

            engine_results = await asyncio.gather(
                *[engine_coro for _, engine_coro in engines],
                return_exceptions=True
            )

            # Aggregate results
            for idx, (engine_name, _) in enumerate(engines):
                engine_result = engine_results[idx]

                if isinstance(engine_result, Exception):
                    logger.error(
                        "engine_failed",
                        engine=engine_name,
                        error=str(engine_result)
                    )
                    continue

                result.issues.extend(engine_result.issues)
                result.operations.extend(engine_result.operations)
                result.execution_times[engine_name] = engine_result.execution_time

                logger.info(
                    "engine_completed",
                    engine=engine_name,
                    issues=len(engine_result.issues),
                    operations=len(engine_result.operations),
                    time_s=engine_result.execution_time
                )

            result.completed_at = datetime.utcnow()
            total_time = (result.completed_at - start_time).total_seconds()
            result.execution_times["total"] = total_time

            logger.info(
                "analysis_completed",
                deck_id=deck.id,
                total_issues=len(result.issues),
                total_operations=len(result.operations),
                total_time_s=total_time
            )

            return result

        except Exception as e:
            logger.error("analysis_failed", deck_id=deck.id, error=str(e), exc_info=e)
            raise

    async def _parse_deck(self, deck: Deck) -> AssetGraph:
        """Parse deck based on format"""
        if deck.metadata.format == "pptx":
            parser = PPTXParser()
            return await parser.parse_to_asset_graph(deck.file_path, deck.id)
        else:  # PDF
            parser = PDFParser()
            return await parser.parse_to_asset_graph(deck.file_path, deck.id)


class EngineResult:
    """Result from a single engine"""
    def __init__(self):
        self.issues: List[Issue] = []
        self.operations: List[Operation] = []
        self.execution_time: float = 0.0
