"""
Route Optimizer & Decision Engine for HeatRoute
Implements the core decision pipeline:
1. Safety Filtering
2. Solar & Shade Evaluation
3. Thermal Exposure Integration
4. Detour Enforcement (<= 25% cap)
5. Tri-Modal Classification (Fastest, Balanced, Coolest)
"""

import json
import os
from datetime import datetime, timezone
from typing import Dict, Any, List

from .solar_engine import (
    calculate_solar_position,
    calculate_segment_bearing,
    estimate_segment_shade
)
from .thermal_engine import (
    calculate_heat_index,
    calculate_segment_exposure,
    evaluate_route_thermal_exposure
)
from .safety_filter import filter_candidate_route_safety

from functools import lru_cache

# Load local datasets with in-memory caching to eliminate disk I/O on Lambda / server
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

@lru_cache(maxsize=1)
def load_corridor_data() -> Dict[str, Any]:
    path = os.path.join(DATA_DIR, "delhi_corridors.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

@lru_cache(maxsize=1)
def load_hydration_pois() -> List[Dict[str, Any]]:
    path = os.path.join(DATA_DIR, "hydration_pois.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f).get("hydration_and_recovery_pois", [])


def optimize_routes(
    origin: List[float],
    destination: List[float],
    departure_time_iso: str,
    ambient_temp_c: float = 42.0,
    humidity_pct: float = 45.0,
    max_detour_percent: float = 25.0,
    mode_preference: str = "BALANCED"
) -> Dict[str, Any]:
    """
    Evaluates, ranks, and classifies candidate routes.
    """
    corridor = load_corridor_data()
    raw_pois = load_hydration_pois()

    # Parse departure time
    try:
        dt = datetime.fromisoformat(departure_time_iso)
    except Exception:
        dt = datetime.now(timezone.utc)

    # 1. Atmospheric Baseline
    heat_index_c = calculate_heat_index(ambient_temp_c, humidity_pct)

    # 2. Solar Position
    lat_center = (corridor["origin"]["coordinates"][1] + corridor["destination"]["coordinates"][1]) / 2.0
    lon_center = (corridor["origin"]["coordinates"][0] + corridor["destination"]["coordinates"][0]) / 2.0
    solar_pos = calculate_solar_position(lat_center, lon_center, dt)

    is_night = not solar_pos["is_daylight"]

    evaluated_routes: List[Dict[str, Any]] = []

    for raw_route in corridor["candidate_routes"]:
        # Phase 1: Hard Safety Filter
        safety_result = filter_candidate_route_safety(raw_route, is_nighttime=is_night)
        
        if not safety_result["passed_safety_filter"]:
            # Route failed safety! Add as rejected route for transparency
            evaluated_routes.append({
                "id": raw_route["id"],
                "name": raw_route["name"],
                "mode": "REJECTED_UNSAFE",
                "is_recommended": False,
                "description": raw_route["description"],
                "total_length_m": raw_route["total_length_m"],
                "total_duration_min": raw_route["estimated_baseline_min"],
                "detour_percent": 0.0,
                "raw_exposure_score": 999.0,
                "exposure_label": "HIGH",
                "exposure_color": "#9CA3AF", # Grayed out
                "exposure_reduction_pct": 0.0,
                "avg_shade_percentage": 0.0,
                "safety": safety_result,
                "contributing_factors": [
                    "FAILED SAFETY FILTER: " + "; ".join(safety_result["violations"])
                ],
                "confidence": "HIGH",
                "path_coordinates": raw_route["path_coordinates"],
                "segments": []
            })
            continue

        # Phase 2: Segment-level Solar & Thermal Scoring
        segments_eval = []
        for seg in raw_route["segments"]:
            bearing = calculate_segment_bearing(
                seg["start_coords"][1], seg["start_coords"][0],
                seg["end_coords"][1], seg["end_coords"][0]
            )

            shade_info = estimate_segment_shade(
                bearing_deg=bearing,
                building_height_m=seg.get("building_height_m", 15.0),
                street_width_m=seg.get("street_width_m", 25.0),
                canopy_coverage=seg.get("canopy_coverage", 0.2),
                is_colonnade=seg.get("is_colonnade", False),
                solar_altitude_deg=solar_pos["altitude_deg"],
                solar_azimuth_deg=solar_pos["azimuth_deg"]
            )

            seg_exposure = calculate_segment_exposure(
                length_m=seg["length_m"],
                effective_shade=shade_info["effective_shade"],
                surface_type=seg.get("surface_type", "asphalt"),
                base_heat_index_c=heat_index_c,
                solar_altitude_deg=solar_pos["altitude_deg"]
            )

            segments_eval.append({
                "name": seg["name"],
                "length_m": seg["length_m"],
                "duration_min": seg_exposure["duration_min"],
                "duration_sec": seg_exposure["duration_sec"],
                "surface_type": seg.get("surface_type", "asphalt"),
                "surface_modifier": seg_exposure["surface_modifier"],
                "effective_shade": shade_info["effective_shade"],
                "shade_source": shade_info["shade_source"],
                "thermal_intensity_rate": seg_exposure["thermal_intensity_rate"],
                "segment_exposure_score": seg_exposure["segment_exposure_score"],
                "start_coords": seg["start_coords"],
                "end_coords": seg["end_coords"]
            })

        total_duration_sec = sum(s["duration_min"] * 60.0 for s in segments_eval)
        route_exposure = evaluate_route_thermal_exposure(
            segments_eval, raw_route["total_length_m"], total_duration_sec
        )

        evaluated_routes.append({
            "id": raw_route["id"],
            "name": raw_route["name"],
            "mode": raw_route.get("mode_candidate", "BALANCED"),
            "is_recommended": False,
            "description": raw_route["description"],
            "total_length_m": raw_route["total_length_m"],
            "total_duration_min": round(total_duration_sec / 60.0, 1),
            "detour_percent": 0.0, # Will compute relative to fastest
            "raw_exposure_score": route_exposure["raw_exposure_score"],
            "exposure_label": route_exposure["exposure_label"],
            "exposure_color": route_exposure["exposure_color"],
            "exposure_reduction_pct": 0.0, # Will compute
            "avg_shade_percentage": route_exposure["avg_shade_percentage"],
            "safety": safety_result,
            "contributing_factors": route_exposure["contributing_factors"],
            "confidence": route_exposure["confidence"],
            "path_coordinates": raw_route["path_coordinates"],
            "segments": segments_eval
        })

    # Separate safe routes for ranking
    safe_routes = [r for r in evaluated_routes if r["mode"] != "REJECTED_UNSAFE"]
    if not safe_routes:
        return {
            "routes": evaluated_routes,
            "decision_summary": "All candidate routes failed safety filters."
        }

    # Identify fastest safe route as baseline
    fastest_route = min(safe_routes, key=lambda r: r["total_duration_min"])
    fastest_duration = fastest_route["total_duration_min"]
    fastest_exposure = fastest_route["raw_exposure_score"]

    # Compute detour % and exposure reduction %
    for r in safe_routes:
        detour = ((r["total_duration_min"] - fastest_duration) / max(0.1, fastest_duration)) * 100.0
        r["detour_percent"] = round(max(0.0, detour), 1)

        exposure_diff = ((fastest_exposure - r["raw_exposure_score"]) / max(0.1, fastest_exposure)) * 100.0
        r["exposure_reduction_pct"] = round(max(0.0, exposure_diff), 1)

    # Classify modes
    # Coolest is safe route with lowest exposure within max detour limit
    eligible_coolest = [r for r in safe_routes if r["detour_percent"] <= max_detour_percent]
    coolest_route = min(eligible_coolest or safe_routes, key=lambda r: r["raw_exposure_score"])
    
    # Balanced route balances travel time and shade reduction
    balanced_candidates = [
        r for r in safe_routes 
        if r["id"] != fastest_route["id"] and r["detour_percent"] <= 18.0
    ]
    balanced_route = balanced_candidates[0] if balanced_candidates else coolest_route

    for r in safe_routes:
        if r["id"] == fastest_route["id"]:
            r["mode"] = "FASTEST"
        elif r["id"] == coolest_route["id"] and coolest_route["id"] != fastest_route["id"]:
            r["mode"] = "COOLEST"
        else:
            r["mode"] = "BALANCED"

    # Set recommended route based on user preference
    rec_route = None
    pref_upper = mode_preference.upper()
    for r in safe_routes:
        if r["mode"] == pref_upper:
            r["is_recommended"] = True
            rec_route = r
            break
    if not rec_route:
        # Default to BALANCED or COOLEST
        rec_route = balanced_route or coolest_route or fastest_route
        rec_route["is_recommended"] = True

    # Generate transparent explanation
    time_str = dt.strftime("%I:%M %p")
    if rec_route["mode"] == "COOLEST":
        decision_summary = (
            f"At {time_str} (Sun Altitude: {solar_pos['altitude_deg']:.1f}°), the Coolest Route cuts "
            f"{rec_route['exposure_reduction_pct']}% estimated thermal exposure for a modest "
            f"+{rec_route['detour_percent']}% (+{rec_route['total_duration_min'] - fastest_duration:.1f} min) detour."
        )
    elif rec_route["mode"] == "BALANCED":
        decision_summary = (
            f"At {time_str}, the Balanced Route achieves {rec_route['exposure_reduction_pct']}% lower thermal "
            f"load with only +{rec_route['total_duration_min'] - fastest_duration:.1f} min additional walk time."
        )
    else:
        decision_summary = (
            f"Fastest route prioritized ({fastest_duration:.1f} mins). Note: Has {fastest_route['exposure_label']} thermal exposure."
        )

    # CloudWatch demo telemetry metrics
    aws_telemetry = {
        "aws_region": "ap-south-1 (Mumbai)",
        "lambda_request_id": f"heatroute-req-{int(dt.timestamp())}",
        "cloudwatch_metric": {
            "metric_name": "ThermalStressHoursAvoided",
            "value": round((fastest_exposure - rec_route["raw_exposure_score"]) * 0.05, 3),
            "unit": "StressHours"
        },
        "dynamodb_queried_pois": len(raw_pois),
        "execution_latency_ms": 24.6
    }

    return {
        "status": "SUCCESS",
        "corridor_name": corridor["name"],
        "departure_time": departure_time_iso,
        "solar_altitude_deg": round(solar_pos["altitude_deg"], 1),
        "solar_azimuth_deg": round(solar_pos["azimuth_deg"], 1),
        "ambient_temp_c": ambient_temp_c,
        "relative_humidity": humidity_pct,
        "heat_index_c": heat_index_c,
        "routes": evaluated_routes,
        "hydration_pois": raw_pois,
        "decision_summary": decision_summary,
        "aws_telemetry": aws_telemetry
    }
