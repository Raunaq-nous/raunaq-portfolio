"""
Asset Data Models
Models for slide assets (shapes, text, charts, etc.)
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any
from enum import Enum


class AssetType(str, Enum):
    """Types of slide assets"""
    TEXT_BOX = "text_box"
    SHAPE = "shape"
    IMAGE = "image"
    CHART = "chart"
    TABLE = "table"
    GROUP = "group"
    CONNECTOR = "connector"
    SMART_ART = "smart_art"
    VIDEO = "video"
    AUDIO = "audio"


class BoundingBox(BaseModel):
    """Bounding box for asset positioning"""
    x: float
    y: float
    width: float
    height: float

    def center(self) -> tuple[float, float]:
        """Get center point"""
        return (self.x + self.width / 2, self.y + self.height / 2)

    def area(self) -> float:
        """Get area"""
        return self.width * self.height


class ColorInfo(BaseModel):
    """Color information"""
    rgb: tuple[int, int, int]
    hex: str
    name: Optional[str] = None


class TextRun(BaseModel):
    """Text run with formatting"""
    text: str
    font_name: Optional[str] = None
    font_size: Optional[float] = None
    bold: bool = False
    italic: bool = False
    underline: bool = False
    color: Optional[ColorInfo] = None


class ChartData(BaseModel):
    """Chart data structure"""
    chart_type: str
    series: List[Dict[str, Any]]
    categories: List[str]
    axes: Dict[str, Any]
    legend: Optional[Dict[str, Any]] = None


class TableData(BaseModel):
    """Table data structure"""
    rows: int
    cols: int
    cells: List[List[str]]
    header_row: bool = False
    header_col: bool = False


class Asset(BaseModel):
    """Slide asset"""
    id: str = Field(..., description="Unique asset identifier")
    slide_number: int
    shape_id: str
    shape_name: Optional[str] = None
    type: AssetType

    # Position and size
    bbox: BoundingBox
    z_order: int = 0
    rotation: float = 0.0

    # Styling
    fill_color: Optional[ColorInfo] = None
    line_color: Optional[ColorInfo] = None
    line_width: Optional[float] = None

    # Content
    text_content: Optional[str] = None
    text_runs: List[TextRun] = Field(default_factory=list)
    chart_data: Optional[ChartData] = None
    table_data: Optional[TableData] = None

    # Hierarchy
    is_master_shape: bool = False
    parent_id: Optional[str] = None
    children_ids: List[str] = Field(default_factory=list)

    # Metadata
    metadata: Dict[str, Any] = Field(default_factory=dict)


class AssetGraph(BaseModel):
    """Graph of all assets in a deck"""
    deck_id: str
    slides: Dict[int, List[Asset]] = Field(default_factory=dict)
    asset_index: Dict[str, Asset] = Field(default_factory=dict)

    # Relationships
    groups: Dict[str, List[str]] = Field(default_factory=dict)
    connections: List[tuple[str, str]] = Field(default_factory=list)

    # Computed metrics
    total_assets: int = 0
    assets_by_type: Dict[str, int] = Field(default_factory=dict)

    def get_asset(self, asset_id: str) -> Optional[Asset]:
        """Get asset by ID"""
        return self.asset_index.get(asset_id)

    def get_slide_assets(self, slide_number: int) -> List[Asset]:
        """Get all assets on a slide"""
        return self.slides.get(slide_number, [])

    def find_assets_by_type(self, asset_type: AssetType) -> List[Asset]:
        """Find all assets of a specific type"""
        return [
            asset for asset in self.asset_index.values()
            if asset.type == asset_type
        ]
