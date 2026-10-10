"""
Thermal Exposure Engine for HeatRoute
Calculates atmospheric heat stress, surface albedo adjustments,
segment thermal exposure (STE), and aggregated Relative Thermal Exposure (RTE).
"""

import math
from functools import lru_cache
from typing import Dict, Any, List

# Surface thermal emission & absorption multipliers (relative to neutral shaded surface = 1.0)
SURFACE_MODIFIERS = {
    "asphalt": 1.30,         # Heavy heat storage, low albedo, intense longwave thermal emission
    "concrete": 1.10,        # Standard paved footpath, moderate thermal storage
    "paver_colonnade": 0.95, # Shaded stone pavers / arcade floors
    "vegetated": 0.70,       # Grassy, tree-sheltered park trails, high evaporative cooling
    "mixed": 1.05            # Typical Indian urban commercial corridor with mixed pavers & curb
}


@lru_cache(maxsize=512)
def calculate_heat_index(temp_c: float, humidity_pct: float) -> float:
    """
    Computes Steadman/Rothfusz Heat Index in Celsius.
    Represents perceived environmental heat stress from temperature and humidity.
    """
    if temp_c < 20.0:
        return temp_c

    # Convert to Fahrenheit for standard Rothfusz regression
    T = temp_c * 9.0 / 5.0 + 32.0
    R = max(0.0, min(100.0, humidity_pct))

    # Simplified Heat Index equation
    hi_simple = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (R * 0.094))
    if hi_simple < 80.0:
        hi_f = hi_simple
    else:
        # Full Rothfusz polynomial
        hi_f = (
            -42.379
            + 2.04901523 * T
            + 10.14333127 * R
            - 0.22475541 * T * R
            - 0.00683783 * (T ** 2)
            - 0.05481717 * (R ** 2)
            + 0.00122874 * (T ** 2) * R
            + 0.00085282 * T * (R ** 2)
            - 0.00000199 * (T ** 2) * (R ** 2)
        )

    # Convert back to Celsius
    hi_c = (hi_f - 32.0) * 5.0 / 9.0
    return round(hi_c, 1)


def calculate_segment_exposure(
    length_m: float,
    effective_shade: float,
    surface_type: str,
    base_heat_index_c: float,
    solar_altitude_deg: float,
    solar_radiation_w_m2: float = 650.0,
    wind_speed_kmh: float = 8.0,
    pedestrian_speed_m_s: float = 1.2
) -> Dict[str, Any]:
    """
    Computes Segment Thermal Exposure (STE).
    STE = Duration (sec) * [Base Heat Index + Solar Factor * Surface Multiplier - Wind Relief]
    """
    duration_sec = length_m / max(0.5, pedestrian_speed_m_s)
    surface_mod = SURFACE_MODIFIERS.get(surface_type.lower(), 1.05)

    # Solar direct insolation component (reduced by shade)
    # Higher solar altitude = more perpendicular sunlight
    solar_angle_factor = math.sin(math.radians(max(0.0, solar_altitude_deg)))
    unshaded_fraction = max(0.0, 1.0 - effective_shade)

    # Base atmospheric thermal stress
    base_stress = base_heat_index_c * 0.35

    # Direct solar radiation load (Mean Radiant Temperature component)
    # Direct sun can elevate perceived temperature by 12-18°C above air temp.
    # In shade, solar_load drops towards 0.
    solar_intensity_peak = 28.0  # Max thermal penalty under direct noon sun
    solar_load = (solar_radiation_w_m2 / 800.0) * solar_angle_factor * unshaded_fraction * solar_intensity_peak

    # Ground surface thermal re-radiation modifier
    # Unshaded blacktop asphalt re-radiates intense heat; shaded paver blocks stay cooler.
    effective_surface_heat = (surface_mod - 1.0) * 12.0 * (1.0 - (effective_shade * 0.7))

    # Mild convective wind relief
    wind_cooling = min(4.0, (wind_speed_kmh / 15.0) * 2.0)

    # Human thermal strain rate per minute (Equivalent Thermal Strain Index)
    thermal_rate = base_stress + solar_load + effective_surface_heat - wind_cooling
    thermal_rate = max(8.0, thermal_rate)

    # Time-weighted exposure accumulation (Points = min * rate)
    ste_score = (duration_sec / 60.0) * thermal_rate

    return {
        "length_m": round(length_m, 1),
        "duration_sec": round(duration_sec, 0),
        "duration_min": round(duration_sec / 60.0, 1),
        "surface_type": surface_type,
        "effective_shade": effective_shade,
        "surface_modifier": surface_mod,
        "thermal_intensity_rate": round(thermal_rate, 1),
        "segment_exposure_score": round(ste_score, 1)
    }


def evaluate_route_thermal_exposure(
    segments_evaluation: List[Dict[str, Any]],
    total_length_m: float,
    total_duration_sec: float
) -> Dict[str, Any]:
    """
    Aggregates segment scores into Route Relative Thermal Exposure (RTE).
    Outputs explainable contributing factors and confidence rating.
    """
    total_exposure = sum(seg["segment_exposure_score"] for seg in segments_evaluation)

    # Compute weighted averages for explainability
    weighted_shade = sum(seg["effective_shade"] * seg["duration_sec"] for seg in segments_evaluation) / max(1.0, total_duration_sec)
    weighted_surface_mod = sum(seg["surface_modifier"] * seg["duration_sec"] for seg in segments_evaluation) / max(1.0, total_duration_sec)

    # Categorize Relative Thermal Exposure
    if total_exposure > 750:
        exposure_label = "HIGH"
        exposure_color = "#EF4444" # Red
    elif total_exposure > 550:
        exposure_label = "MODERATE"
        exposure_color = "#F59E0B" # Amber
    else:
        exposure_label = "LOW"
        exposure_color = "#10B981" # Emerald Green

    # Contributing factors
    factors = []
    if weighted_shade > 0.60:
        factors.append("Dense canopy and shaded walkways significantly mitigate direct sun")
    elif weighted_shade < 0.25:
        factors.append("High direct solar exposure with minimal tree or building shade")

    if weighted_surface_mod > 1.20:
        factors.append("Prolonged walking on wide blacktop asphalt radiating ambient heat")
    elif weighted_surface_mod < 0.90:
        factors.append("Cooler ground surface (vegetated park paths / covered colonnades)")

    return {
        "raw_exposure_score": round(total_exposure, 1),
        "exposure_label": exposure_label,
        "exposure_color": exposure_color,
        "avg_shade_percentage": round(weighted_shade * 100, 1),
        "avg_surface_modifier": round(weighted_surface_mod, 2),
        "contributing_factors": factors,
        "confidence": "HIGH"
    }
