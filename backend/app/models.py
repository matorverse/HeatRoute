"""
Pydantic Schemas for HeatRoute API
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class Coordinates(BaseModel):
    lat: float
    lon: float


class RouteRequest(BaseModel):
    origin: List[float] = Field(default=[77.2195, 28.6328], description="[lon, lat]")
    destination: List[float] = Field(default=[77.2345, 28.6258], description="[lon, lat]")
    departure_time: Optional[str] = Field(default="2026-06-15T13:30:00+05:30", description="ISO departure time")
    ambient_temp_c: Optional[float] = Field(default=42.5, description="Ambient temperature override in Celsius")
    relative_humidity: Optional[float] = Field(default=48.0, description="Relative humidity override %")
    max_detour_percent: Optional[float] = Field(default=25.0, description="Max acceptable detour vs fastest route")
    mode_preference: Optional[str] = Field(default="BALANCED", description="FASTEST | BALANCED | COOLEST")
    season: Optional[str] = Field(default="SUMMER", description="SUMMER | MONSOON")
    corridor_id: Optional[str] = Field(default="DELHI_CP_TO_MANDI_HOUSE", description="Corridor identifier")
    pitstop_poi_id: Optional[str] = Field(default=None, description="Optional hydration POI waypoint")


class SegmentOutput(BaseModel):
    name: str
    length_m: float
    duration_min: float
    surface_type: str
    effective_shade: float
    shade_source: str
    thermal_intensity_rate: float
    segment_exposure_score: float
    start_coords: List[float]
    end_coords: List[float]
    is_covered: Optional[bool] = False
    waterlogging_risk: Optional[str] = "NONE"


class SafetyInfo(BaseModel):
    passed_safety_filter: bool
    safety_verdict: str
    safety_score: float
    violations: List[str] = []


class NavigationStep(BaseModel):
    step_num: int
    instruction: str
    distance_m: float
    shade_info: str
    water_nearby: Optional[str] = None


class EvaluatedRoute(BaseModel):
    id: str
    name: str
    mode: str  # FASTEST | BALANCED | COOLEST | REJECTED_UNSAFE
    is_recommended: bool = False
    description: str
    total_length_m: float
    total_duration_min: float
    detour_percent: float
    raw_exposure_score: float
    exposure_label: str  # LOW | MODERATE | HIGH
    exposure_color: str
    exposure_reduction_pct: float
    avg_shade_percentage: float
    waterlogging_risk: Optional[str] = "NONE"
    safety: SafetyInfo
    contributing_factors: List[str]
    confidence: str
    path_coordinates: List[List[float]]
    segments: List[SegmentOutput]
    steps: Optional[List[NavigationStep]] = []


class HydrationPOI(BaseModel):
    id: str
    name: str
    type: str
    coordinates: List[float]
    verified_status: str
    features: List[str]
    accessibility: str
    last_verified_hours_ago: float


class RouteResponse(BaseModel):
    status: str
    corridor_id: str = "DELHI_CP_TO_MANDI_HOUSE"
    corridor_name: str
    active_season: str = "SUMMER"
    departure_time: str
    solar_altitude_deg: float
    solar_azimuth_deg: float
    ambient_temp_c: float
    relative_humidity: float
    heat_index_c: float
    routes: List[EvaluatedRoute]
    hydration_pois: List[HydrationPOI]
    decision_summary: str
    aws_telemetry: Dict[str, Any]
