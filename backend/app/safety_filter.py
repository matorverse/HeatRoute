"""
Pedestrian Safety Filter for HeatRoute
Enforces the cardinal rule:
SAFETY FIRST -> HEAT OPTIMIZATION SECOND -> TRAVEL-TIME OPTIMIZATION THIRD.
Unsafe candidate routes (highways without sidewalks, unlit nighttime shortcuts, active hazards)
are strictly disqualified before thermal ranking occurs.
"""

from typing import Dict, Any, Tuple, List


# Highway classifications forbidden for pedestrians
FORBIDDEN_HIGHWAYS = {
    "motorway",
    "motorway_link",
    "trunk",
    "trunk_link",
    "expressway",
    "flyover"
}


def evaluate_segment_safety(segment: Dict[str, Any], is_nighttime: bool = False) -> Tuple[bool, str]:
    """
    Evaluates individual segment safety constraints.
    Returns (is_safe, rejection_reason).
    """
    highway_type = segment.get("highway_type", "footway").lower()
    if highway_type in FORBIDDEN_HIGHWAYS:
        return False, f"Prohibited pedestrian highway classification: {highway_type}"

    has_sidewalk = segment.get("has_sidewalk", True)
    speed_limit_kmh = segment.get("speed_limit_kmh", 30)
    if not has_sidewalk and speed_limit_kmh > 40:
        return False, "High-speed vehicular roadway without segregated pedestrian sidewalk"

    if segment.get("active_hazard", False):
        hazard_desc = segment.get("hazard_description", "Active hazard / construction barrier")
        return False, hazard_desc

    if is_nighttime:
        is_lit = segment.get("is_lit", True)
        if not is_lit:
            return False, "Unlit secluded corridor at night"

    return True, "Safe"


def filter_candidate_route_safety(
    route: Dict[str, Any],
    is_nighttime: bool = False
) -> Dict[str, Any]:
    """
    Evaluates entire route against pedestrian safety criteria.
    If ANY segment is fundamentally unsafe, the entire route fails the hard safety filter.
    """
    segments = route.get("segments", [])
    violations: List[str] = []

    for idx, seg in enumerate(segments):
        is_safe, reason = evaluate_segment_safety(seg, is_nighttime=is_nighttime)
        if not is_safe:
            violations.append(f"Segment {idx + 1} ({seg.get('name', 'Unnamed')}): {reason}")

    if violations:
        return {
            "passed_safety_filter": False,
            "safety_verdict": "REJECTED_UNSAFE",
            "violations": violations,
            "safety_score": 0.0
        }

    # Calculate overall safety score (0.0 to 1.0)
    sidewalk_fraction = sum(1 for seg in segments if seg.get("has_sidewalk", True)) / max(1, len(segments))
    crossings_safe = all(seg.get("controlled_crossing", True) for seg in segments if "crossing" in seg.get("highway_type", ""))
    
    score = 0.7 + (0.2 * sidewalk_fraction) + (0.1 if crossings_safe else 0.0)
    score = round(min(1.0, score), 2)

    return {
        "passed_safety_filter": True,
        "safety_verdict": "VERIFIED_SAFE",
        "violations": [],
        "safety_score": score
    }
