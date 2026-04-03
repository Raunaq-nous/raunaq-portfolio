"""
PDF Exporter
Export annotated PDFs with issue markers
"""

import fitz
from typing import List
import os
from datetime import datetime
import structlog

from app.models.deck import Deck
from app.models.issue import Issue
from app.utils.config import settings

logger = structlog.get_logger()


class PDFExporter:
    """Export annotated PDFs"""

    async def export_annotated(self, deck: Deck, issues: List[Issue]) -> str:
        """Export deck with annotations"""
        try:
            # Open source deck
            if deck.metadata.format == "pptx":
                # Convert PPTX to PDF first (simplified)
                source_path = await self._pptx_to_pdf(deck.file_path)
            else:
                source_path = deck.file_path

            doc = fitz.open(source_path)

            # Add annotations for each issue
            for issue in issues:
                page_idx = issue.location.slide_number - 1
                if page_idx >= len(doc):
                    continue

                page = doc[page_idx]

                # Add sticky note annotation
                if issue.location.bounding_box:
                    bbox = issue.location.bounding_box
                    rect = fitz.Rect(
                        bbox["x"] * 72,
                        bbox["y"] * 72,
                        (bbox["x"] + bbox["width"]) * 72,
                        (bbox["y"] + bbox["height"]) * 72
                    )
                else:
                    rect = fitz.Rect(50, 50, 100, 100)  # Default position

                # Color by severity
                severity_colors = {
                    "critical": (1, 0, 0),  # Red
                    "high": (1, 0.5, 0),    # Orange
                    "medium": (1, 1, 0),    # Yellow
                    "low": (0, 1, 0),       # Green
                    "info": (0, 0, 1)       # Blue
                }
                color = severity_colors.get(issue.severity.value, (1, 1, 0))

                # Add annotation
                annot = page.add_text_annot(
                    rect.tl,
                    f"[{issue.severity.value.upper()}] {issue.title}\n\n{issue.description}"
                )
                annot.set_colors(stroke=color)
                annot.update()

            # Save annotated PDF
            output_path = os.path.join(
                settings.TEMP_DIR,
                f"{deck.id}_annotated_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"
            )

            doc.save(output_path)
            doc.close()

            logger.info("pdf_exported", output_path=output_path, issues=len(issues))

            return output_path

        except Exception as e:
            logger.error("pdf_export_failed", error=str(e), exc_info=e)
            raise

    async def _pptx_to_pdf(self, pptx_path: str) -> str:
        """Convert PPTX to PDF (simplified stub)"""
        # In production, use LibreOffice or similar
        # For now, just copy and rename for demonstration
        pdf_path = pptx_path.replace(".pptx", ".pdf")
        logger.warning("pptx_to_pdf_stub", message="Using stub conversion")
        return pdf_path
