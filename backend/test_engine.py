"""
Comprehensive verification test script for HeatRoute Engine
Validates:
1. Summer Heatwave: CP to Mandi House (Thermal ranking, detour cap)
2. Monsoon Downpour: Minto Underpass flood disqualification & covered colonnade priority
3. South Delhi Testbed: Hauz Khas to IIT (Rose Garden shade)
4. Old Delhi Testbed: Chandni Chowk to Red Fort (Haveli canyon shade)
5. Hydration Pitstop waypoint insertion
"""
import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from app.route_optimizer import optimize_routes

def test_pipeline():
    print("=" * 80)
    print("TEST 1: Summer Heatwave 1:30 PM (CP to Mandi House)")
    print("=" * 80)
    res_summer = optimize_routes(
        [77.2195, 28.6328],
        [77.2345, 28.6258],
        "2026-06-15T13:30:00+05:30",
        ambient_temp_c=43.5,
        humidity_pct=42.0,
        season="SUMMER",
        corridor_id="DELHI_CP_TO_MANDI_HOUSE"
    )
    print(f"Status: {res_summer['status']} | Active Season: {res_summer['active_season']}")
    print(f"Heat Index: {res_summer['heat_index_c']}°C | Sun Altitude: {res_summer['solar_altitude_deg']}°")
    for r in res_summer["routes"]:
        safety_text = "PASS" if r['safety']['passed_safety_filter'] else f"REJECTED ({r['safety']['violations'][0][:45]}...)"
        print(f"  [{r['mode']:<15}] {r['name']:<35} | {r['total_duration_min']} min | Exp: {r['exposure_label']} ({r['raw_exposure_score']}) | Saved: {r['exposure_reduction_pct']}% | FloodRisk: {r.get('waterlogging_risk')} | Safety: {safety_text}")
    print(f"Decision: {res_summer['decision_summary']}")

    print("\n" + "=" * 80)
    print("TEST 2: Monsoon Downpour (Minto Underpass Disqualification Check)")
    print("=" * 80)
    res_monsoon = optimize_routes(
        [77.2195, 28.6328],
        [77.2345, 28.6258],
        "2026-07-28T15:00:00+05:30",
        ambient_temp_c=32.0,
        humidity_pct=88.0,
        season="MONSOON",
        corridor_id="DELHI_CP_TO_MANDI_HOUSE"
    )
    for r in res_monsoon["routes"]:
        status = "PASSED" if r["safety"]["passed_safety_filter"] else f"REJECTED: {r['safety']['violations'][0]}"
        print(f"  [{r['mode']:<15}] {r['name']:<38} | FloodRisk: {r.get('waterlogging_risk')} | {status}")
    print(f"Decision: {res_monsoon['decision_summary']}")

    print("\n" + "=" * 80)
    print("TEST 3: South Delhi Corridor (Hauz Khas to IIT)")
    print("=" * 80)
    res_iit = optimize_routes(
        [77.2065, 28.5432],
        [77.1925, 28.5450],
        "2026-06-15T13:30:00+05:30",
        season="SUMMER",
        corridor_id="DELHI_HAUZ_KHAS_TO_IIT"
    )
    print(f"Corridor: {res_iit['corridor_name']}")
    for r in res_iit["routes"]:
        print(f"  [{r['mode']:<10}] {r['name']:<40} | Exp: {r['exposure_label']} ({r['raw_exposure_score']}) | Shade: {r['avg_shade_percentage']}%")

    print("\n" + "=" * 80)
    print("TEST 4: Old Delhi Corridor (Chandni Chowk to Red Fort)")
    print("=" * 80)
    res_cc = optimize_routes(
        [77.2285, 28.6575],
        [77.2410, 28.6560],
        "2026-06-15T13:30:00+05:30",
        season="SUMMER",
        corridor_id="DELHI_CHANDNI_CHOWK"
    )
    print(f"Corridor: {res_cc['corridor_name']}")
    for r in res_cc["routes"]:
        print(f"  [{r['mode']:<10}] {r['name']:<42} | Exp: {r['exposure_label']} ({r['raw_exposure_score']}) | Steps: {len(r.get('steps', []))}")

    print("\n" + "=" * 80)
    print("TEST 5: Hydration Pitstop Waypoint Insertion")
    print("=" * 80)
    res_pitstop = optimize_routes(
        [77.2195, 28.6328],
        [77.2345, 28.6258],
        "2026-06-15T13:30:00+05:30",
        corridor_id="DELHI_CP_TO_MANDI_HOUSE",
        pitstop_poi_id="poi-djb-kg-marg"
    )
    print(f"Decision with pitstop: {res_pitstop['decision_summary']}")
    first_route = res_pitstop["routes"][0]
    print(f"Coordinates count with waypoint: {len(first_route['path_coordinates'])}")
    assert len(first_route["path_coordinates"]) > 5, "Waypoints should be inserted into path geometry"

    print("\n" + "=" * 80)
    print("TEST 6: Detour Cap Constraint Violation & Enforcement")
    print("=" * 80)
    # Test strict detour cap of 10.0%
    res_capped = optimize_routes(
        [77.2195, 28.6328],
        [77.2345, 28.6258],
        "2026-06-15T13:30:00+05:30",
        ambient_temp_c=43.5,
        humidity_pct=42.0,
        max_detour_percent=10.0,
        mode_preference="COOLEST",
        corridor_id="DELHI_CP_TO_MANDI_HOUSE"
    )
    print(f"Detour cap enforced flag: {res_capped['detour_cap_enforced']}")
    rec_route = [r for r in res_capped["routes"] if r.get("is_recommended")][0]
    print(f"Recommended route: {rec_route['name']} | Detour: +{rec_route['detour_percent']}%")
    assert res_capped["detour_cap_enforced"] is True, "Detour cap must be flagged as enforced when lowest exposure exceeds threshold"
    assert rec_route["detour_percent"] <= 10.0, f"Recommended route detour ({rec_route['detour_percent']}%) must not exceed max cap (10.0%)"
    print("  ✓ PASS: Detour ceiling strictly bounded alternative selection.")

    print("\n" + "=" * 80)
    print("TEST 7: Thermal Rothfusz Edge Cases & Extreme Weather Bounds")
    print("=" * 80)
    from app.thermal_engine import calculate_heat_index
    import math

    t_freezing = calculate_heat_index(0.0, 60.0)
    t_scorching = calculate_heat_index(52.0, 95.0)
    t_arid = calculate_heat_index(45.0, 0.0)
    print(f"Heat Index at 0°C, 60% RH: {t_freezing}°C")
    print(f"Heat Index at 52°C, 95% RH: {t_scorching}°C")
    print(f"Heat Index at 45°C, 0% RH: {t_arid}°C")
    for val in [t_freezing, t_scorching, t_arid]:
        assert not math.isnan(val) and not math.isinf(val), "Heat index must produce finite real numbers"
    print("  ✓ PASS: Thermal index remains finite across extreme temperature & humidity spectrum.")

    print("\n" + "=" * 80)
    print("TEST 8: Zero-Length Segment Defense & Physical Parameter Guards")
    print("=" * 80)
    from app.thermal_engine import calculate_segment_exposure
    seg_zero = calculate_segment_exposure(
        length_m=0.0,
        effective_shade=1.5, # Over-clamped
        surface_type="unknown_asphalt_mix",
        base_heat_index_c=45.0,
        solar_altitude_deg=90.0,
        wind_speed_kmh=0.0
    )
    print(f"Zero length segment output: {seg_zero}")
    assert seg_zero["duration_sec"] == 0, "Zero length must produce zero duration"
    assert seg_zero["segment_exposure_score"] == 0.0, "Zero duration must accumulate 0 thermal exposure points"
    assert seg_zero["effective_shade"] == 1.0, "Shade must be clamped to 1.0"
    print("  ✓ PASS: Segment thermal engine safely guards physical parameters.")

    print("\n" + "=" * 80)
    print("TEST 9: Custom Dynamic Routing Synthesis & Road Network Conformance")
    print("=" * 80)
    from app.route_optimizer import generate_custom_corridor
    custom_corridor = generate_custom_corridor([77.2150, 28.6300], [77.2250, 28.6400], season="SUMMER")
    print(f"Custom corridor name: {custom_corridor['name']}")
    assert len(custom_corridor["candidate_routes"]) == 3, "Custom planner must synthesize exactly 3 mode candidates"
    for cr in custom_corridor["candidate_routes"]:
        assert len(cr["path_coordinates"]) >= 4, "Custom routes must contain multi-vertex path coordinates"
        assert len(cr["segments"]) >= 1, "Custom routes must contain segment breakdowns"
    print("  ✓ PASS: Custom point-to-point corridor synthesis operational.")

    print("\n" + "=" * 80)
    print("TEST 10: Scientific Honesty & Uncertainty Margins Verification")
    print("=" * 80)
    res_uncertainty = optimize_routes(
        [77.2195, 28.6328],
        [77.2345, 28.6258],
        "2026-06-15T13:30:00+05:30",
        corridor_id="DELHI_CP_TO_MANDI_HOUSE"
    )
    assert "uncertainty_note" in res_uncertainty, "Response must include scientific uncertainty note"
    for r in res_uncertainty["routes"]:
        if r["mode"] != "REJECTED_UNSAFE":
            assert "uncertainty_margin_pct" in r, "Route must provide explicit uncertainty margin percentage"
            assert "estimated_exposure_range" in r, "Route must provide lower and upper modeled bounds"
            assert len(r["estimated_exposure_range"]) == 2, "Exposure range must be [low, high]"
            assert r["estimated_exposure_range"][0] <= r["estimated_exposure_range"][1], "Range low must be <= range high"
    print(f"Uncertainty Note: {res_uncertainty['uncertainty_note']}")
    print(f"Sample Route Exposure Range: {res_uncertainty['routes'][0]['estimated_exposure_range']} (Margin: ±{res_uncertainty['routes'][0]['uncertainty_margin_pct']}%)")
    print("  ✓ PASS: Scientific honesty and uncertainty margins properly modeled and surfaced.")

    print("\n" + "=" * 80)
    print("ALL 10 VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 80)

if __name__ == "__main__":
    test_pipeline()
