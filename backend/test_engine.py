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

if __name__ == "__main__":
    test_pipeline()
