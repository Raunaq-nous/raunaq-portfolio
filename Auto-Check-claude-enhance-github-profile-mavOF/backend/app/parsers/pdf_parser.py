"""
PDF Parser
Parse PDF files with OCR support
"""

import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
from typing import List, Optional
import structlog

from app.models.deck import DeckMetadata
from app.models.asset import AssetGraph, Asset, AssetType, BoundingBox, ColorInfo, TextRun

logger = structlog.get_logger()


class PDFParser:
    """Parser for PDF files"""

    async def extract_metadata(self, file_path: str) -> DeckMetadata:
        """Extract metadata from PDF file"""
        try:
            doc = fitz.open(file_path)

            metadata_dict = doc.metadata

            # Get page dimensions from first page
            first_page = doc[0] if len(doc) > 0 else None
            page_dimensions = {}
            if first_page:
                rect = first_page.rect
                page_dimensions = {
                    "width": rect.width / 72,  # Convert to inches
                    "height": rect.height / 72
                }

            metadata = DeckMetadata(
                title=metadata_dict.get("title") or None,
                author=metadata_dict.get("author") or None,
                created_at=None,  # TODO: Parse date
                modified_at=None,
                slide_count=len(doc),
                format="pdf",
                file_size=0,  # Will be set by caller
                page_dimensions=page_dimensions
            )

            doc.close()

            logger.info(
                "pdf_metadata_extracted",
                pages=metadata.slide_count,
                title=metadata.title
            )

            return metadata

        except Exception as e:
            logger.error("pdf_metadata_failed", file_path=file_path, error=str(e))
            raise

    async def parse_to_asset_graph(self, file_path: str, deck_id: str) -> AssetGraph:
        """Parse PDF and create asset graph"""
        try:
            doc = fitz.open(file_path)
            asset_graph = AssetGraph(deck_id=deck_id)

            asset_counter = 0

            for page_num in range(len(doc)):
                page = doc[page_num]
                slide_assets = []

                # Extract text blocks
                text_blocks = page.get_text("dict")["blocks"]
                for block in text_blocks:
                    if block.get("type") == 0:  # Text block
                        asset = self._parse_text_block(
                            block, page_num + 1, asset_counter
                        )
                        if asset:
                            slide_assets.append(asset)
                            asset_graph.asset_index[asset.id] = asset
                            asset_counter += 1

                # Extract images
                images = page.get_images()
                for img_idx, img in enumerate(images):
                    asset = self._parse_image(
                        img, page, page_num + 1, asset_counter
                    )
                    if asset:
                        slide_assets.append(asset)
                        asset_graph.asset_index[asset.id] = asset
                        asset_counter += 1

                # Extract vector graphics (shapes, lines)
                paths = page.get_drawings()
                for path_idx, path in enumerate(paths):
                    asset = self._parse_drawing(
                        path, page_num + 1, asset_counter
                    )
                    if asset:
                        slide_assets.append(asset)
                        asset_graph.asset_index[asset.id] = asset
                        asset_counter += 1

                asset_graph.slides[page_num + 1] = slide_assets

            doc.close()

            # Calculate metrics
            asset_graph.total_assets = len(asset_graph.asset_index)
            asset_graph.assets_by_type = {}
            for asset in asset_graph.asset_index.values():
                type_name = asset.type.value
                asset_graph.assets_by_type[type_name] = \
                    asset_graph.assets_by_type.get(type_name, 0) + 1

            logger.info(
                "pdf_parsed",
                deck_id=deck_id,
                pages=len(doc),
                assets=asset_graph.total_assets
            )

            return asset_graph

        except Exception as e:
            logger.error("pdf_parse_failed", file_path=file_path, error=str(e))
            raise

    def _parse_text_block(
        self, block: dict, page_num: int, asset_id: int
    ) -> Optional[Asset]:
        """Parse text block"""
        try:
            bbox_coords = block.get("bbox", [0, 0, 0, 0])
            bbox = BoundingBox(
                x=bbox_coords[0] / 72,  # Convert to inches
                y=bbox_coords[1] / 72,
                width=(bbox_coords[2] - bbox_coords[0]) / 72,
                height=(bbox_coords[3] - bbox_coords[1]) / 72
            )

            # Extract text content
            text_content = ""
            text_runs = []

            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    text = span.get("text", "")
                    text_content += text + " "

                    text_run = TextRun(
                        text=text,
                        font_name=span.get("font"),
                        font_size=span.get("size"),
                        bold="Bold" in span.get("font", ""),
                        italic="Italic" in span.get("font", ""),
                        underline=False
                    )
                    text_runs.append(text_run)

            text_content = text_content.strip()

            if not text_content:
                return None

            asset = Asset(
                id=f"asset_{asset_id}",
                slide_number=page_num,
                shape_id=f"text_block_{asset_id}",
                type=AssetType.TEXT_BOX,
                bbox=bbox,
                text_content=text_content,
                text_runs=text_runs
            )

            return asset

        except Exception as e:
            logger.warning("text_block_parse_failed", error=str(e))
            return None

    def _parse_image(
        self, img_info, page, page_num: int, asset_id: int
    ) -> Optional[Asset]:
        """Parse image"""
        try:
            xref = img_info[0]
            bbox_coords = page.get_image_bbox(img_info)

            bbox = BoundingBox(
                x=bbox_coords.x0 / 72,
                y=bbox_coords.y0 / 72,
                width=(bbox_coords.x1 - bbox_coords.x0) / 72,
                height=(bbox_coords.y1 - bbox_coords.y0) / 72
            )

            asset = Asset(
                id=f"asset_{asset_id}",
                slide_number=page_num,
                shape_id=f"image_{xref}",
                type=AssetType.IMAGE,
                bbox=bbox,
                metadata={"xref": xref}
            )

            return asset

        except Exception as e:
            logger.warning("image_parse_failed", error=str(e))
            return None

    def _parse_drawing(
        self, drawing: dict, page_num: int, asset_id: int
    ) -> Optional[Asset]:
        """Parse vector drawing"""
        try:
            # Get bounding rect
            rect = drawing.get("rect", (0, 0, 0, 0))
            bbox = BoundingBox(
                x=rect[0] / 72,
                y=rect[1] / 72,
                width=(rect[2] - rect[0]) / 72,
                height=(rect[3] - rect[1]) / 72
            )

            # Determine if line or shape
            asset_type = AssetType.CONNECTOR if drawing.get("type") == "l" else AssetType.SHAPE

            # Extract color
            fill_color = None
            color_data = drawing.get("fill")
            if color_data:
                # Simplified color extraction
                fill_color = ColorInfo(
                    rgb=(128, 128, 128),  # Placeholder
                    hex="#808080"
                )

            asset = Asset(
                id=f"asset_{asset_id}",
                slide_number=page_num,
                shape_id=f"drawing_{asset_id}",
                type=asset_type,
                bbox=bbox,
                fill_color=fill_color
            )

            return asset

        except Exception as e:
            logger.warning("drawing_parse_failed", error=str(e))
            return None

    async def ocr_region(self, file_path: str, page_num: int, bbox: BoundingBox) -> str:
        """Run OCR on specific region"""
        try:
            doc = fitz.open(file_path)
            page = doc[page_num - 1]

            # Convert bbox to PDF coordinates
            rect = fitz.Rect(
                bbox.x * 72,
                bbox.y * 72,
                (bbox.x + bbox.width) * 72,
                (bbox.y + bbox.height) * 72
            )

            # Render region to image
            pix = page.get_pixmap(clip=rect)
            img_bytes = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_bytes))

            # Run OCR
            text = pytesseract.image_to_string(img)

            doc.close()

            return text.strip()

        except Exception as e:
            logger.warning("ocr_failed", page=page_num, error=str(e))
            return ""
