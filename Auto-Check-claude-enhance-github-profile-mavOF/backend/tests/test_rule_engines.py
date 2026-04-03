"""
Test Rule Engines
Unit tests for validation rule engines
"""

import pytest
from app.rule_engines.formatting_engine import FormattingEngine
from app.rule_engines.language_engine import LanguageEngine
from app.rule_engines.numeric_engine import NumericEngine
from app.rule_engines.chart_engine import ChartEngine
from app.models.deck import Deck, DeckMetadata
from app.models.asset import AssetGraph


@pytest.fixture
def sample_deck():
    """Create sample deck for testing"""
    return Deck(
        id="test_deck_123",
        filename="test.pptx",
        file_path="/tmp/test.pptx",
        metadata=DeckMetadata(
            slide_count=5,
            format="pptx",
            file_size=1024000
        )
    )


@pytest.fixture
def sample_asset_graph():
    """Create sample asset graph for testing"""
    return AssetGraph(deck_id="test_deck_123")


class TestFormattingEngine:
    """Test formatting engine"""

    @pytest.mark.asyncio
    async def test_wcag_contrast_check(self, sample_deck, sample_asset_graph):
        """Test WCAG contrast checking"""
        engine = FormattingEngine()
        result = await engine.analyze(sample_deck, sample_asset_graph)
        assert result is not None
        assert hasattr(result, 'issues')
        assert hasattr(result, 'operations')


class TestLanguageEngine:
    """Test language engine"""

    @pytest.mark.asyncio
    async def test_language_analysis(self, sample_deck, sample_asset_graph):
        """Test language analysis"""
        engine = LanguageEngine()
        result = await engine.analyze(sample_deck, sample_asset_graph)
        assert result is not None


class TestNumericEngine:
    """Test numeric engine"""

    @pytest.mark.asyncio
    async def test_numeric_validation(self, sample_deck, sample_asset_graph):
        """Test numeric validation"""
        engine = NumericEngine()
        result = await engine.analyze(sample_deck, sample_asset_graph)
        assert result is not None


class TestChartEngine:
    """Test chart engine"""

    @pytest.mark.asyncio
    async def test_chart_analysis(self, sample_deck, sample_asset_graph):
        """Test chart analysis"""
        engine = ChartEngine()
        result = await engine.analyze(sample_deck, sample_asset_graph)
        assert result is not None
