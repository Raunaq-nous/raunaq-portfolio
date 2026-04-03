"""
Formatting & Hierarchy Rule Engine
Deterministic rules for layout, colors, typography, accessibility
"""

from typing import List
import uuid
from datetime import datetime
import math
import structlog

from app.models.deck import Deck
from app.models.asset import AssetGraph, Asset, AssetType, ColorInfo
from app.models.issue import Issue, IssueSeverity, IssueCategory, IssueLocation
from app.models.operation import Operation, OperationType, OperationTarget, OperationChange, OperationStatus
from app.rule_engines.analyzer import EngineResult
from app.utils.config import settings

logger = structlog.get_logger()


class FormattingEngine:
    """Formatting and hierarchy validation engine"""

    async def analyze(self, deck: Deck, asset_graph: AssetGraph) -> EngineResult:
        """Run formatting analysis"""
        start_time = datetime.utcnow()
        result = EngineResult()

        try:
            # Run all formatting rules
            await self._check_wcag_contrast(deck, asset_graph, result)
            await self._check_alignment(deck, asset_graph, result)
            await self._check_consistency(deck, asset_graph, result)
            await self._check_color_palette(deck, asset_graph, result)
            await self._check_typography(deck, asset_graph, result)

            result.execution_time = (datetime.utcnow() - start_time).total_seconds()
            return result

        except Exception as e:
            logger.error("formatting_engine_failed", error=str(e), exc_info=e)
            result.execution_time = (datetime.utcnow() - start_time).total_seconds()
            return result

    async def _check_wcag_contrast(
        self, deck: Deck, asset_graph: AssetGraph, result: EngineResult
    ):
        """Check WCAG contrast ratios"""
        for slide_num, assets in asset_graph.slides.items():
            for asset in assets:
                if asset.type != AssetType.TEXT_BOX or not asset.text_runs:
                    continue

                for run_idx, text_run in enumerate(asset.text_runs):
                    if not text_run.color:
                        continue

                    # Get background color (simplified - assumes white bg)
                    bg_color = (255, 255, 255)
                    text_color = text_run.color.rgb

                    contrast_ratio = self._calculate_contrast_ratio(text_color, bg_color)

                    # Determine required ratio
                    font_size = text_run.font_size or 12
                    is_large_text = font_size >= settings.MIN_FONT_SIZE_LARGE
                    required_ratio = (
                        settings.WCAG_LARGE_TEXT_RATIO if is_large_text
                        else settings.WCAG_NORMAL_TEXT_RATIO
                    )

                    if contrast_ratio < required_ratio:
                        issue_id = f"issue_{uuid.uuid4().hex[:12]}"
                        op_id = f"op_{uuid.uuid4().hex[:12]}"

                        issue = Issue(
                            id=issue_id,
                            deck_id=deck.id,
                            category=IssueCategory.ACCESSIBILITY,
                            severity=IssueSeverity.HIGH,
                            title="Insufficient contrast ratio",
                            description=f"Text contrast ratio {contrast_ratio:.2f}:1 is below WCAG {'AA large' if is_large_text else 'AA'} requirement of {required_ratio}:1",
                            rationale=f"WCAG 2.1 requires minimum contrast ratios for accessibility",
                            location=IssueLocation(
                                slide_number=slide_num,
                                shape_id=asset.shape_id,
                                shape_name=asset.shape_name,
                                bounding_box={
                                    "x": asset.bbox.x,
                                    "y": asset.bbox.y,
                                    "width": asset.bbox.width,
                                    "height": asset.bbox.height
                                }
                            ),
                            current_value=f"Contrast {contrast_ratio:.2f}:1",
                            suggested_value=f"Increase to {required_ratio}:1 or higher",
                            rule_id="fmt_001",
                            rule_name="wcag_contrast_check",
                            auto_fixable=True,
                            operation_id=op_id,
                            citations=["WCAG 2.1 - Contrast (Minimum) - 1.4.3"],
                            confidence=1.0
                        )

                        # Create operation to fix contrast
                        improved_color = self._improve_contrast(text_color, bg_color, required_ratio)

                        operation = Operation(
                            id=op_id,
                            deck_id=deck.id,
                            issue_id=issue_id,
                            type=OperationType.COLOR_CHANGE,
                            target=OperationTarget(
                                slide_number=slide_num,
                                shape_id=asset.shape_id,
                                path=["text_runs", str(run_idx), "color"]
                            ),
                            changes=[
                                OperationChange(
                                    property="color",
                                    before=text_run.color.hex,
                                    after=f"#{improved_color[0]:02x}{improved_color[1]:02x}{improved_color[2]:02x}"
                                )
                            ],
                            rule_id="fmt_001",
                            rule_name="wcag_contrast_fix",
                            category="accessibility",
                            rationale="Improve text contrast to meet WCAG AA standards",
                            citations=["WCAG 2.1 - Contrast (Minimum)"],
                            confidence=0.95,
                            status=OperationStatus.PENDING
                        )

                        result.issues.append(issue)
                        result.operations.append(operation)

    async def _check_alignment(
        self, deck: Deck, asset_graph: AssetGraph, result: EngineResult
    ):
        """Check alignment and distribution"""
        for slide_num, assets in asset_graph.slides.items():
            if len(assets) < 2:
                continue

            # Group assets by approximate vertical position
            y_groups = self._group_by_position(assets, axis='y', tolerance=10)

            for group in y_groups:
                if len(group) < 2:
                    continue

                # Check if elements are aligned
                y_positions = [asset.bbox.y for asset in group]
                if max(y_positions) - min(y_positions) > 5:  # 5 pixel tolerance
                    # Create issue for misalignment
                    issue_id = f"issue_{uuid.uuid4().hex[:12]}"

                    issue = Issue(
                        id=issue_id,
                        deck_id=deck.id,
                        category=IssueCategory.FORMATTING,
                        severity=IssueSeverity.MEDIUM,
                        title="Misaligned elements",
                        description=f"{len(group)} elements on slide {slide_num} are not properly aligned",
                        rationale="Elements at similar positions should be aligned for visual consistency",
                        location=IssueLocation(slide_number=slide_num),
                        current_value=f"Y positions vary by {max(y_positions) - min(y_positions):.1f} pixels",
                        suggested_value="Align to common baseline",
                        rule_id="fmt_002",
                        rule_name="alignment_check",
                        auto_fixable=True,
                        citations=["Design Best Practices - Alignment"],
                        confidence=0.9
                    )

                    result.issues.append(issue)

    async def _check_consistency(
        self, deck: Deck, asset_graph: AssetGraph, result: EngineResult
    ):
        """Check formatting consistency across slides"""
        # Collect all font sizes used
        font_sizes = {}
        for slide_num, assets in asset_graph.slides.items():
            for asset in assets:
                if not asset.text_runs:
                    continue
                for run in asset.text_runs:
                    if run.font_size:
                        size = run.font_size
                        if size not in font_sizes:
                            font_sizes[size] = []
                        font_sizes[size].append((slide_num, asset.shape_id))

        # Flag if too many different font sizes
        if len(font_sizes) > 6:
            issue = Issue(
                id=f"issue_{uuid.uuid4().hex[:12]}",
                deck_id=deck.id,
                category=IssueCategory.FORMATTING,
                severity=IssueSeverity.LOW,
                title="Too many font sizes",
                description=f"Deck uses {len(font_sizes)} different font sizes",
                rationale="Limit to 3-5 font sizes for visual hierarchy",
                location=IssueLocation(slide_number=1),
                current_value=f"{len(font_sizes)} font sizes",
                suggested_value="Consolidate to 3-5 sizes",
                rule_id="fmt_003",
                rule_name="font_consistency",
                auto_fixable=False,
                citations=["Typography Best Practices"],
                confidence=0.85
            )
            result.issues.append(issue)

    async def _check_color_palette(
        self, deck: Deck, asset_graph: AssetGraph, result: EngineResult
    ):
        """Check color palette conformity"""
        # Collect all colors used
        colors_used = set()
        for slide_num, assets in asset_graph.slides.items():
            for asset in assets:
                if asset.fill_color:
                    colors_used.add(asset.fill_color.hex)
                if asset.line_color:
                    colors_used.add(asset.line_color.hex)

        # If brand pack specified, check against it
        if deck.brand_pack and "colors" in deck.brand_pack:
            brand_colors = set(deck.brand_pack["colors"])
            off_brand_colors = colors_used - brand_colors

            if off_brand_colors:
                issue = Issue(
                    id=f"issue_{uuid.uuid4().hex[:12]}",
                    deck_id=deck.id,
                    category=IssueCategory.FORMATTING,
                    severity=IssueSeverity.MEDIUM,
                    title="Off-brand colors detected",
                    description=f"{len(off_brand_colors)} colors not in brand palette",
                    rationale="Maintain brand consistency by using approved color palette",
                    location=IssueLocation(slide_number=1),
                    current_value=f"Using {len(off_brand_colors)} unapproved colors",
                    suggested_value="Snap to nearest brand colors",
                    rule_id="fmt_004",
                    rule_name="brand_color_check",
                    auto_fixable=True,
                    citations=["Brand Guidelines"],
                    confidence=0.95
                )
                result.issues.append(issue)

    async def _check_typography(
        self, deck: Deck, asset_graph: AssetGraph, result: EngineResult
    ):
        """Check typography rules"""
        for slide_num, assets in asset_graph.slides.items():
            for asset in assets:
                if not asset.text_runs:
                    continue

                # Check for very small fonts
                for run in asset.text_runs:
                    if run.font_size and run.font_size < 10:
                        issue = Issue(
                            id=f"issue_{uuid.uuid4().hex[:12]}",
                            deck_id=deck.id,
                            category=IssueCategory.ACCESSIBILITY,
                            severity=IssueSeverity.MEDIUM,
                            title="Font size too small",
                            description=f"Font size {run.font_size}pt is too small for readability",
                            rationale="Minimum recommended font size is 10pt for body text",
                            location=IssueLocation(
                                slide_number=slide_num,
                                shape_id=asset.shape_id
                            ),
                            current_value=f"{run.font_size}pt",
                            suggested_value="≥10pt",
                            rule_id="fmt_005",
                            rule_name="min_font_size",
                            auto_fixable=True,
                            citations=["Typography Guidelines"],
                            confidence=1.0
                        )
                        result.issues.append(issue)

    def _calculate_contrast_ratio(self, color1: tuple, color2: tuple) -> float:
        """Calculate WCAG contrast ratio between two colors"""
        def relative_luminance(rgb):
            r, g, b = [x / 255.0 for x in rgb]
            r = r / 12.92 if r <= 0.03928 else ((r + 0.055) / 1.055) ** 2.4
            g = g / 12.92 if g <= 0.03928 else ((g + 0.055) / 1.055) ** 2.4
            b = b / 12.92 if b <= 0.03928 else ((b + 0.055) / 1.055) ** 2.4
            return 0.2126 * r + 0.7152 * g + 0.0722 * b

        l1 = relative_luminance(color1)
        l2 = relative_luminance(color2)

        lighter = max(l1, l2)
        darker = min(l1, l2)

        return (lighter + 0.05) / (darker + 0.05)

    def _improve_contrast(
        self, text_color: tuple, bg_color: tuple, target_ratio: float
    ) -> tuple:
        """Improve text color to meet contrast ratio"""
        # Simplified: darken or lighten text color
        current_ratio = self._calculate_contrast_ratio(text_color, bg_color)

        if current_ratio >= target_ratio:
            return text_color

        # Try darkening
        darker = tuple(max(0, int(c * 0.7)) for c in text_color)
        if self._calculate_contrast_ratio(darker, bg_color) >= target_ratio:
            return darker

        # Try lightening
        lighter = tuple(min(255, int(c * 1.3)) for c in text_color)
        if self._calculate_contrast_ratio(lighter, bg_color) >= target_ratio:
            return lighter

        # Default to black or white
        if sum(bg_color) > 382:  # Light background
            return (0, 0, 0)
        else:
            return (255, 255, 255)

    def _group_by_position(
        self, assets: List[Asset], axis: str, tolerance: float
    ) -> List[List[Asset]]:
        """Group assets by position on an axis"""
        groups = []
        sorted_assets = sorted(
            assets,
            key=lambda a: a.bbox.y if axis == 'y' else a.bbox.x
        )

        current_group = [sorted_assets[0]]
        current_pos = sorted_assets[0].bbox.y if axis == 'y' else sorted_assets[0].bbox.x

        for asset in sorted_assets[1:]:
            pos = asset.bbox.y if axis == 'y' else asset.bbox.x
            if abs(pos - current_pos) <= tolerance:
                current_group.append(asset)
            else:
                groups.append(current_group)
                current_group = [asset]
                current_pos = pos

        if current_group:
            groups.append(current_group)

        return groups
