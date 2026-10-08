"""
Quick verification test script for HeatRoute
"""
from app.route_optimizer import optimize_routes

def test():
    print("Testing 1:30 PM (Peak Delhi June Heat)...")
    res_midday = optimize_routes(
        [77.2195, 28.6328],
        [77.2345, 28.6258],
        "2026-06-15T13:30:00+05:30",
        ambient_temp_c=43.5,
        humidity_pct=42.0
    )
    print(f"Status: {res_midday['status']}")
    print(f"Solar Altitude: {res_midday['solar_altitude_deg']}° | Azimuth: {res_midday['solar_azimuth_deg']}°")
    print(f"Base Heat Index: {res_midday['heat_index_c']}°C")
    print("\nEvaluated Routes at 1:30 PM:")
    for r in res_midday["routes"]:
        safety_text = "PASS" if r['safety']['passed_safety_filter'] else f"REJECTED ({r['safety']['violations'][0]})"
        print(f"  [{r['mode']:<15}] {r['name']:<35} | {r['total_duration_min']} min | Exp: {r['exposure_label']} ({r['raw_exposure_score']}) | Saved: {r['exposure_reduction_pct']}% | Detour: +{r['detour_percent']}% | Safety: {safety_text}")
    print(f"\nDecision Summary:\n{res_midday['decision_summary']}\n")

    print("-" * 70)
    print("Testing 4:45 PM (Late Afternoon - Building Shadows Lengthen)...")
    res_evening = optimize_routes(
        [77.2195, 28.6328],
        [77.2345, 28.6258],
        "2026-06-15T16:45:00+05:30",
        ambient_temp_c=40.0,
        humidity_pct=40.0
    )
    print(f"Solar Altitude: {res_evening['solar_altitude_deg']}° | Azimuth: {res_evening['solar_azimuth_deg']}°")
    for r in res_evening["routes"]:
        if r['mode'] != "REJECTED_UNSAFE":
            print(f"  [{r['mode']:<10}] {r['name']:<35} | {r['total_duration_min']} min | Exp: {r['exposure_label']} ({r['raw_exposure_score']}) | Shade: {r['avg_shade_percentage']}%")

if __name__ == "__main__":
    test()
