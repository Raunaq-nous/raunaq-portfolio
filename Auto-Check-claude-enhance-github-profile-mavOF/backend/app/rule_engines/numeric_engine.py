"""
Numeric & Valuation Rule Engine
Cross-slide number ties, math validation, valuation checks
"""

from typing import List, Dict
import uuid
from datetime import datetime
import re
import structlog

from app.models.deck import Deck
from app.models.asset import AssetGraph, AssetType
from app.models.issue import Issue, IssueSeverity, IssueCategory, IssueLocation
from app.rule_engines.analyzer import EngineResult
from app.utils.config import settings

logger = structlog.get_logger()


class NumericEngine:
    """Numeric validation and valuation checks"""

    async def analyze(self, deck: Deck, asset_graph: AssetGraph) -> EngineResult:
        """Run numeric analysis"""
        start_time = datetime.utcnow()
        result = EngineResult()

        try:
            # Extract all numbers
            numbers_map = self._extract_numbers(asset_graph)

            # Run checks
            await self._check_number_ties(deck, numbers_map, result)
            await self._check_table_math(deck, asset_graph, result)
            await self._check_valuation_heuristics(deck, numbers_map, result)

            result.execution_time = (datetime.utcnow() - start_time).total_seconds()
            return result

        except Exception as e:
            logger.error("numeric_engine_failed", error=str(e), exc_info=e)
            result.execution_time = (datetime.utcnow() - start_time).total_seconds()
            return result

    def _extract_numbers(self, asset_graph: AssetGraph) -> Dict:
        """Extract all numbers with their contexts"""
        numbers = {}

        for slide_num, assets in asset_graph.slides.items():
            for asset in assets:
                if not asset.text_content:
                    continue

                # Extract numbers with units
                number_pattern = r'(\d+(?:,\d{3})*(?:\.\d+)?)\s*([%MBKmbn$€£¥]|bps|basis points)?'
                matches = re.findall(number_pattern, asset.text_content, re.IGNORECASE)

                for match in matches:
                    value_str, unit = match
                    value = self._normalize_number(value_str, unit)

                    key = f"{slide_num}_{asset.shape_id}_{value_str}"
                    numbers[key] = {
                        "value": value,
                        "original": value_str,
                        "unit": unit,
                        "slide": slide_num,
                        "shape_id": asset.shape_id,
                        "context": asset.text_content[:50]
                    }

        return numbers

    def _normalize_number(self, value_str: str, unit: str) -> float:
        """Normalize number to common base"""
        # Remove commas
        value_str = value_str.replace(",", "")
        value = float(value_str)

        # Apply unit multipliers
        unit_multipliers = {
            "K": 1_000,
            "M": 1_000_000,
            "MM": 1_000_000,
            "B": 1_000_000_000,
            "bn": 1_000_000_000,
            "%": 0.01,
            "bps": 0.0001
        }

        if unit and unit in unit_multipliers:
            value *= unit_multipliers[unit]

        return value

    async def _check_number_ties(
        self, deck: Deck, numbers_map: Dict, result: EngineResult
    ):
        """Check for inconsistent numbers across slides"""
        # Group similar numbers (within tolerance)
        tolerance = settings.NUMERIC_TOLERANCE

        values_list = list(numbers_map.values())
        for i, num1 in enumerate(values_list):
            for num2 in values_list[i+1:]:
                if num1["slide"] == num2["slide"]:
                    continue

                # Check if values are similar but not identical
                if abs(num1["value"] - num2["value"]) / max(abs(num1["value"]), abs(num2["value"])) < tolerance:
                    if num1["original"] != num2["original"]:
                        issue = Issue(
                            id=f"issue_{uuid.uuid4().hex[:12]}",
                            deck_id=deck.id,
                            category=IssueCategory.NUMERIC,
                            severity=IssueSeverity.HIGH,
                            title="Inconsistent number representation",
                            description=f"Similar values shown differently: {num1['original']} vs {num2['original']}",
                            rationale="Same values should be presented consistently across slides",
                            location=IssueLocation(
                                slide_number=num1["slide"],
                                shape_id=num1["shape_id"]
                            ),
                            current_value=f"{num1['original']} (slide {num1['slide']}) vs {num2['original']} (slide {num2['slide']})",
                            suggested_value="Use consistent formatting",
                            rule_id="num_001",
                            rule_name="number_consistency",
                            auto_fixable=False,
                            citations=["Numeric Presentation Guidelines"],
                            confidence=0.85
                        )
                        result.issues.append(issue)

    async def _check_table_math(
        self, deck: Deck, asset_graph: AssetGraph, result: EngineResult
    ):
        """Check math in tables"""
        for slide_num, assets in asset_graph.slides.items():
            for asset in assets:
                if asset.type != AssetType.TABLE or not asset.table_data:
                    continue

                table = asset.table_data

                # Check row sums
                for row_idx, row in enumerate(table.cells):
                    numbers = []
                    for cell in row:
                        try:
                            num = float(cell.replace(",", "").replace("%", ""))
                            numbers.append(num)
                        except:
                            continue

                    if len(numbers) >= 3:
                        # Check if last column is sum
                        calculated_sum = sum(numbers[:-1])
                        stated_sum = numbers[-1]

                        if abs(calculated_sum - stated_sum) > 0.01:
                            issue = Issue(
                                id=f"issue_{uuid.uuid4().hex[:12]}",
                                deck_id=deck.id,
                                category=IssueCategory.NUMERIC,
                                severity=IssueSeverity.CRITICAL,
                                title="Table math error",
                                description=f"Row {row_idx + 1}: Sum {stated_sum} doesn't match calculated {calculated_sum:.2f}",
                                rationale="Table totals must be mathematically correct",
                                location=IssueLocation(
                                    slide_number=slide_num,
                                    shape_id=asset.shape_id
                                ),
                                current_value=f"Stated: {stated_sum}",
                                suggested_value=f"Should be: {calculated_sum:.2f}",
                                rule_id="num_002",
                                rule_name="table_math_check",
                                auto_fixable=True,
                                confidence=0.99
                            )
                            result.issues.append(issue)

    async def _check_valuation_heuristics(
        self, deck: Deck, numbers_map: Dict, result: EngineResult
    ):
        """Check valuation-specific heuristics"""
        # Look for WACC
        wacc_pattern = r'WACC.*?(\d+(?:\.\d+)?)\s*%'

        for key, num_data in numbers_map.items():
            context = num_data["context"]

            if "WACC" in context.upper():
                wacc_value = num_data["value"] * 100 if num_data["value"] < 1 else num_data["value"]

                # WACC should typically be 5-15%
                if wacc_value < 3 or wacc_value > 20:
                    issue = Issue(
                        id=f"issue_{uuid.uuid4().hex[:12]}",
                        deck_id=deck.id,
                        category=IssueCategory.VALUATION,
                        severity=IssueSeverity.MEDIUM,
                        title="WACC outside typical range",
                        description=f"WACC of {wacc_value:.1f}% is unusual (typical: 5-15%)",
                        rationale="Verify WACC calculation and assumptions",
                        location=IssueLocation(
                            slide_number=num_data["slide"],
                            shape_id=num_data["shape_id"]
                        ),
                        current_value=f"{wacc_value:.1f}%",
                        suggested_value="Verify calculation",
                        rule_id="num_003",
                        rule_name="wacc_heuristic",
                        auto_fixable=False,
                        citations=["Valuation Best Practices"],
                        confidence=0.70
                    )
                    result.issues.append(issue)
