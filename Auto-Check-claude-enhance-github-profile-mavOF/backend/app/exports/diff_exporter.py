"""
Diff Exporter
Export HTML diff views
"""

import os
from datetime import datetime
import structlog

from app.models.deck import Deck
from app.utils.config import settings

logger = structlog.get_logger()


class DiffExporter:
    """Export diff views"""

    async def export_html_diff(self, deck: Deck) -> str:
        """Export HTML diff"""
        try:
            output_path = os.path.join(
                settings.TEMP_DIR,
                f"{deck.id}_diff_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.html"
            )

            html_content = self._generate_html_diff(deck)

            with open(output_path, "w") as f:
                f.write(html_content)

            logger.info("diff_exported", output_path=output_path)

            return output_path

        except Exception as e:
            logger.error("diff_export_failed", error=str(e), exc_info=e)
            raise

    def _generate_html_diff(self, deck: Deck) -> str:
        """Generate HTML diff content"""
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Deck Diff - {deck.filename}</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            margin: 20px;
        }}
        .header {{
            background: #f0f0f0;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
        }}
        .diff-container {{
            display: flex;
            gap: 20px;
        }}
        .before, .after {{
            flex: 1;
            border: 1px solid #ccc;
            padding: 10px;
            border-radius: 5px;
        }}
        .before {{ background: #ffe0e0; }}
        .after {{ background: #e0ffe0; }}
        .change {{
            margin: 10px 0;
            padding: 10px;
            border-left: 3px solid #333;
        }}
        .change-title {{
            font-weight: bold;
            margin-bottom: 5px;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Deck Diff: {deck.filename}</h1>
        <p>Analysis completed: {deck.analyzed_at or 'In progress'}</p>
        <p>Total changes: {len(deck.change_history)}</p>
    </div>

    <div class="diff-container">
        <div class="before">
            <h2>Original</h2>
            <p>Original deck content would be displayed here...</p>
        </div>
        <div class="after">
            <h2>Modified</h2>
            <p>Modified deck content with changes applied would be displayed here...</p>
        </div>
    </div>

    <div class="changes">
        <h2>Change Log</h2>
        <p>Detailed change log would appear here...</p>
    </div>
</body>
</html>
"""
        return html
