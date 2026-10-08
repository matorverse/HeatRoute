/**
 * HeatRoute API Service
 * Dual-Mode: Seamlessly connects to live AWS / local FastAPI backend,
 * with deterministic in-browser calculation fallback so demos NEVER fail.
 */

import { FALLBACK_EVALUATION, FALLBACK_HYDRATION_POIS } from "../data/fallbackData";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

export async function fetchRouteEvaluation(params = {}) {
  const {
    departureTime = "2026-06-15T13:30:00+05:30",
    ambientTempC = 43.5,
    humidityPct = 42.0,
    modePreference = "BALANCED",
    maxDetourPercent = 25.0
  } = params;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s quick timeout

    const res = await fetch(`${BACKEND_URL}/api/v1/routes/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        origin: [77.2195, 28.6328],
        destination: [77.2345, 28.6258],
        departure_time: departureTime,
        ambient_temp_c: ambientTempC,
        relative_humidity: humidityPct,
        max_detour_percent: maxDetourPercent,
        mode_preference: modePreference
      })
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return { ...data, is_live_cloud: true };
    }
  } catch (err) {
    console.info("Notice: Live backend unreachable, activating deterministic in-browser engine:", err.message);
  }

  // Resilient deterministic client-side calculation for departure time shifts
  return simulateTimeShiftEvaluation(departureTime, ambientTempC, humidityPct, modePreference);
}

/**
 * Calculates in-browser dynamic solar & exposure shifts when offline
 */
function simulateTimeShiftEvaluation(timeIso, tempC, humidityPct, modePref) {
  const date = new Date(timeIso);
  const hour = date.getHours() + date.getMinutes() / 60;

  // Approximate solar altitude for Delhi in June
  // Peaks around 12:45 - 1:30 PM (~75°), drops in late afternoon
  let solarAlt = 0;
  if (hour >= 6 && hour <= 19) {
    solarAlt = Math.max(5, Math.sin(((hour - 6) / 13) * Math.PI) * 75);
  }

  const isLateAfternoon = hour >= 16.0;
  const isMorning = hour <= 10.0;

  // Clone fallback routes
  const cloned = JSON.parse(JSON.stringify(FALLBACK_EVALUATION));
  cloned.is_live_cloud = false;
  cloned.is_fallback_mode = true;
  cloned.departure_time = timeIso;
  cloned.solar_altitude_deg = Math.round(solarAlt * 10) / 10;
  cloned.ambient_temp_c = tempC;
  cloned.relative_humidity = humidityPct;

  // Modify route exposures based on time-dependent shade
  cloned.routes.forEach(route => {
    if (route.mode === "REJECTED_UNSAFE") return;

    if (route.id === "route-direct-barakhamba") {
      // Barakhamba road gets tall commercial building shadow in late afternoon (sun in west)
      if (isLateAfternoon) {
        route.avg_shade_percentage = 62.5;
        route.raw_exposure_score = 485.4;
        route.exposure_label = "LOW";
        route.exposure_color = "#10B981";
      } else if (isMorning) {
        route.avg_shade_percentage = 45.0;
        route.raw_exposure_score = 590.2;
        route.exposure_label = "MODERATE";
        route.exposure_color = "#F59E0B";
      } else {
        route.avg_shade_percentage = 15.2;
        route.raw_exposure_score = 877.3;
        route.exposure_label = "HIGH";
        route.exposure_color = "#EF4444";
      }
    } else if (route.id === "route-canopy-kg-marg") {
      route.avg_shade_percentage = 74.0;
      route.raw_exposure_score = isLateAfternoon ? 460.0 : 667.5;
      route.exposure_label = isLateAfternoon ? "LOW" : "MODERATE";
      route.exposure_color = isLateAfternoon ? "#10B981" : "#F59E0B";
    } else if (route.id === "route-colonnade-coolest") {
      route.avg_shade_percentage = 88.0;
      route.raw_exposure_score = isLateAfternoon ? 430.0 : 597.7;
      route.exposure_label = isLateAfternoon ? "LOW" : "MODERATE";
      route.exposure_color = "#10B981";
    }
  });

  // Re-compute percentage savings relative to fastest
  const fastest = cloned.routes.find(r => r.id === "route-direct-barakhamba");
  cloned.routes.forEach(r => {
    if (r.mode !== "REJECTED_UNSAFE" && fastest) {
      const saved = ((fastest.raw_exposure_score - r.raw_exposure_score) / fastest.raw_exposure_score) * 100;
      r.exposure_reduction_pct = Math.max(0, Math.round(saved * 10) / 10);
    }
  });

  // Format decision summary
  const timeFormatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isLateAfternoon) {
    cloned.decision_summary = `At ${timeFormatted} (Sun Angle: ${cloned.solar_altitude_deg}°), high-rise towers along Barakhamba cast deep canyon shadows. Thermal exposure drops significantly across all corridors.`;
  } else {
    cloned.decision_summary = `At ${timeFormatted} (Sun Angle: ${cloned.solar_altitude_deg}°), midday direct sunlight is intense. CP Colonnade & KG Marg routes provide 24% to 32% thermal exposure reduction.`;
  }

  return cloned;
}
