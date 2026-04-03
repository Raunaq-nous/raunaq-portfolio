"""
Chart Integrity Rule Engine
Chart validation based on Tufte/Few principles
"""

from typing import List
import uuid
from datetime import datetime
import structlog

from app.models.deck import Deck
from app.models.asset import AssetGraph, AssetType
from app.models.issue import Issue, IssueSeverity, IssueCategory, IssueLocation
from app.rule_engines.analyzer import EngineResult

logger = structlog.get_logger()


class ChartEngine:
    """Chart integrity validation"""

    async def analyze(self, deck: Deck, asset_graph: AssetGraph) -> EngineResult:
        """Run chart analysis"""
        start_time = datetime.utcnow()
        result = EngineResult()

        try:
            await self._check_chart_integrity(deck, asset_graph, result)
            await self._check_chart_clarity(deck, asset_graph, result)

            result.execution_time = (datetime.utcnow() - start_time).total_seconds()
            return result

        except Exception as e:
            logger.error("chart_engine_failed", error=str(e), exc_info=e)
            result.execution_time = (datetime.utcnow() - start_time).total_seconds()
            return result

    async def _check_chart_integrity(
        self, deck: Deck, asset_graph: AssetGraph, result: EngineResult
    ):
        """Check chart data integrity"""
        for slide_num, assets in asset_graph.slides.items():
            for asset in assets:
                if asset.type != AssetType.CHART or not asset.chart_data:
                    continue

                chart = asset.chart_data

                # Check for missing data
                for series in chart.series:
                    if None in series.get("values", []):
                        issue = Issue(
                            id=f"issue_{uuid.uuid4().hex[:12]}",
                            deck_id=deck.id,
                            category=IssueCategory.CHART,
                            severity=IssueSeverity.MEDIUM,
                            title="Chart has missing data points",
                            description=f"Series '{series.get('name', 'Unknown')}' contains null values",
                            rationale="Missing data points should be addressed or explained",
                            location=IssueLocation(
                                slide_number=slide_num,
                                shape_id=asset.shape_id
                            ),
                            current_value="Contains null values",
                            suggested_value="Fill or remove missing data",
                            rule_id="chart_001",
                            rule_name="missing_data_check",
                            auto_fixable=False,
                            citations=["Data Visualization Best Practices"],
                            confidence=1.0
                        )
                        result.issues.append(issue)

                # Check series count
                if len(chart.series) > 7:
                    issue = Issue(
                        id=f"issue_{uuid.uuid4().hex[:12]}",
                        deck_id=deck.id,
                        category=IssueCategory.CHART,
                        severity=IssueSeverity.LOW,
                        title="Too many chart series",
                        description=f"Chart has {len(chart.series)} series (recommended: ≤7)",
                        rationale="Charts with too many series are hard to read (Tufte principle)",
                        location=IssueLocation(
                            slide_number=slide_num,
                            shape_id=asset.shape_id
                        ),
                        current_value=f"{len(chart.series)} series",
                        suggested_value="Consolidate to ≤7 series",
                        rule_id="chart_002",
                        rule_name="series_count_check",
                        auto_fixable=False,
                        citations=["Stephen Few - Chart Design Principles"],
                        confidence=0.80
                    )
                    result.issues.append(issue)

    async def _check_chart_clarity(
        self, deck: Deck, asset_graph: AssetGraph, result: EngineResult
    ):
        """Check chart clarity (Tufte/Few principles)"""
        for slide_num, assets in asset_graph.slides.items():
            for asset in assets:
                if asset.type != AssetType.CHART:
                    continue

                # Check chart size
                if asset.bbox.area() < 20:  # Small chart
                    issue = Issue(
                        id=f"issue_{uuid.uuid4().hex[:12]}",
                        deck_id=deck.id,
                        category=IssueCategory.CHART,
                        severity=IssueSeverity.LOW,
                        title="Chart may be too small",
                        description=f"Chart area is {asset.bbox.area():.1f} sq inches",
                        rationale="Charts should be large enough to read clearly",
                        location=IssueLocation(
                            slide_number=slide_num,
                            shape_id=asset.shape_id
                        ),
                        current_value=f"{asset.bbox.area():.1f} sq in",
                        suggested_value="≥20 sq inches recommended",
                        rule_id="chart_003",
                        rule_name="chart_size_check",
                        auto_fixable=True,
                        citations=["Data Visualization Guidelines"],
                        confidence=0.75
                    )
                    result.issues.append(issue)
