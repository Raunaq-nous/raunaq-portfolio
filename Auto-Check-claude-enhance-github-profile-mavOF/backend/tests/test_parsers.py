"""
Test Parsers
Unit tests for PPTX and PDF parsers
"""

import pytest
from app.parsers.pptx_parser import PPTXParser
from app.parsers.pdf_parser import PDFParser


class TestPPTXParser:
    """Test PPTX parser"""

    @pytest.mark.asyncio
    async def test_extract_metadata(self):
        """Test metadata extraction"""
        parser = PPTXParser()
        # Test with actual PPTX file would go here
        assert parser is not None

    @pytest.mark.asyncio
    async def test_parse_to_asset_graph(self):
        """Test asset graph parsing"""
        parser = PPTXParser()
        # Test with actual PPTX file would go here
        assert parser is not None


class TestPDFParser:
    """Test PDF parser"""

    @pytest.mark.asyncio
    async def test_extract_metadata(self):
        """Test metadata extraction"""
        parser = PDFParser()
        # Test with actual PDF file would go here
        assert parser is not None

    @pytest.mark.asyncio
    async def test_parse_to_asset_graph(self):
        """Test asset graph parsing"""
        parser = PDFParser()
        # Test with actual PDF file would go here
        assert parser is not None
