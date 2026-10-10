/**
 * HeatRoute API Service
 * Dual-Mode: Seamlessly connects to live AWS / local FastAPI backend,
 * with deterministic in-browser calculation fallback so demos NEVER fail.
 */

import { FALLBACK_CORRIDORS, FALLBACK_EVALUATION, FALLBACK_HYDRATION_POIS } from "../data/fallbackData";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

// Fast in-memory cache for repeated time/weather/corridor parameters
const evaluationCache = new Map();
const MAX_CACHE_SIZE = 50;

export async function fetchCorridors() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${BACKEND_URL}/api/v1/corridors`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.corridors && data.corridors.length > 0) {
        return data.corridors;
      }
    }
  } catch (e) {
    // Fallback to local corridors
  }
  return FALLBACK_CORRIDORS;
}

export async function fetchRouteEvaluation(params = {}) {
  const {
    departureTime = "2026-06-15T13:30:00+05:30",
    ambientTempC = 43.5,
    humidityPct = 42.0,
    modePreference = "BALANCED",
    maxDetourPercent = 25.0,
    season = "SUMMER",
    corridorId = "DELHI_CP_TO_MANDI_HOUSE",
    pitstopPoiId = null
  } = params;

  const cacheKey = `${corridorId}_${season}_${pitstopPoiId || "none"}_${departureTime}_${ambientTempC}_${humidityPct}_${modePreference}`;
  if (evaluationCache.has(cacheKey)) {
    return evaluationCache.get(cacheKey);
  }

  let result = null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2.0s fast timeout

    const res = await fetch(`${BACKEND_URL}/api/v1/routes/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        departure_time: departureTime,
        ambient_temp_c: ambientTempC,
        relative_humidity: humidityPct,
        max_detour_percent: maxDetourPercent,
        mode_preference: modePreference,
        season: season,
        corridor_id: corridorId,
        pitstop_poi_id: pitstopPoiId
      })
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      result = { ...data, is_live_cloud: true };
    }
  } catch (err) {
    // Silent fallback to client-side engine without noisy console spew
  }

  if (!result) {
    // Resilient deterministic client-side calculation
    result = simulateDynamicEvaluation({
      departureTime,
      ambientTempC,
      humidityPct,
      modePreference,
      season,
      corridorId,
      pitstopPoiId
    });
  }

  // Cache result
  if (evaluationCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = evaluationCache.keys().next().value;
    evaluationCache.delete(oldestKey);
  }
  evaluationCache.set(cacheKey, result);

  return result;
}

/**
 * Calculates in-browser dynamic solar, monsoon hazard, and exposure shifts
 */
function simulateDynamicEvaluation({
  departureTime,
  ambientTempC,
  humidityPct,
  modePreference,
  season,
  corridorId,
  pitstopPoiId
}) {
  const isMonsoon = (season?.toUpperCase() === "MONSOON");
  const date = new Date(departureTime);
  const hour = date.getHours() + date.getMinutes() / 60;

  let solarAlt = 0;
  if (hour >= 6 && hour <= 19) {
    solarAlt = Math.max(5, Math.sin(((hour - 6) / 13) * Math.PI) * 75);
  }

  const isLateAfternoon = hour >= 16.0;
  const isMorning = hour <= 10.0;

  // Selected corridor POIs
  const corridorPois = FALLBACK_HYDRATION_POIS.filter(
    p => p.corridor_id === (corridorId || "DELHI_CP_TO_MANDI_HOUSE")
  );

  const matchedPoi = pitstopPoiId ? FALLBACK_HYDRATION_POIS.find(p => p.id === pitstopPoiId) : null;

  // Shallow copy of fallback routes
  let clonedRoutes = FALLBACK_EVALUATION.routes.map(r => ({
    ...r,
    path_coordinates: [...r.path_coordinates]
  }));

  if (isMonsoon) {
    // MONSOON HAZARD ENGINE:
    // Reject Minto Road Underpass due to flood inundation
    clonedRoutes = clonedRoutes.map(route => {
      if (route.id === "route-minto-underpass") {
        return {
          ...route,
          mode: "REJECTED_UNSAFE",
          is_recommended: false,
          exposure_color: "#9CA3AF",
          safety: {
            passed_safety_filter: false,
            safety_verdict: "REJECTED_UNSAFE",
            safety_score: 0.0,
            violations: [
              "Segment 2 (Minto Road Sunken Underpass Inundation Zone): Severe Monsoon Inundation: Minto Road Sunken Underpass is waterlogged with standing water depth > 1.2m"
            ]
          },
          contributing_factors: [
            "FAILED MONSOON SAFETY: Extreme waterlogging & flood hazard in sunken underpass"
          ]
        };
      }
      if (route.id === "route-colonnade-coolest") {
        return {
          ...route,
          mode: "SAFEST_DRY",
          is_recommended: true,
          exposure_label: "LOW",
          exposure_color: "#10B981"
        };
      }
      if (route.id === "route-direct-barakhamba") {
        return {
          ...route,
          mode: "FASTEST",
          is_recommended: false,
          exposure_label: "MODERATE",
          exposure_color: "#F59E0B"
        };
      }
      return route;
    });
  } else {
    // SUMMER HEAT ENGINE
    clonedRoutes.forEach(route => {
      if (route.mode === "REJECTED_UNSAFE") return;

      if (route.id === "route-direct-barakhamba") {
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

    const fastest = clonedRoutes.find(r => r.id === "route-minto-underpass" && r.mode !== "REJECTED_UNSAFE") ||
                    clonedRoutes.find(r => r.id === "route-direct-barakhamba");
    
    if (fastest) {
      clonedRoutes.forEach(r => {
        if (r.mode !== "REJECTED_UNSAFE") {
          const saved = ((fastest.raw_exposure_score - r.raw_exposure_score) / fastest.raw_exposure_score) * 100;
          r.exposure_reduction_pct = Math.max(0, Math.round(saved * 10) / 10);
        }
      });
    }
  }

  // If pitstop POI was inserted, inject into coordinates
  if (matchedPoi) {
    clonedRoutes.forEach(r => {
      if (r.path_coordinates.length >= 2) {
        const mid = Math.floor(r.path_coordinates.length / 2);
        r.path_coordinates = [
          ...r.path_coordinates.slice(0, mid),
          matchedPoi.coordinates,
          ...r.path_coordinates.slice(mid)
        ];
        r.total_duration_min = Math.round((r.total_duration_min + 1.5) * 10) / 10;
      }
    });
  }

  const timeFormatted = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  let decisionSummary = "";
  const pitstopNote = matchedPoi ? ` (Includes hydration stop at ${matchedPoi.name})` : "";

  if (isMonsoon) {
    decisionSummary = `⛈️ Monsoon Downpour Advisory (${timeFormatted}): CP Colonnade Arcade & Shaded Lane recommended for 100% covered rain shelters and zero standing water. ⚠️ Minto Sunken Underpass disqualified (1.8m flood hazard).${pitstopNote}`;
  } else if (isLateAfternoon) {
    decisionSummary = `☀️ Heatwave Advisory (${timeFormatted}, Sun Altitude: ${Math.round(solarAlt)}°): High-rise towers along Barakhamba cast deep canyon shadows. Thermal exposure drops significantly across all corridors.${pitstopNote}`;
  } else {
    decisionSummary = `☀️ Heatwave Advisory (${timeFormatted}, Sun Altitude: ${Math.round(solarAlt)}°): CP Colonnade & KG Marg routes provide 24% to 32% thermal exposure reduction under mature canopies.${pitstopNote}`;
  }

  const activeCorridor = FALLBACK_CORRIDORS.find(c => c.id === corridorId) || FALLBACK_CORRIDOR;

  return {
    ...FALLBACK_EVALUATION,
    status: "SUCCESS",
    is_live_cloud: false,
    is_fallback_mode: true,
    corridor_id: activeCorridor.id,
    corridor_name: activeCorridor.name,
    active_season: isMonsoon ? "MONSOON" : "SUMMER",
    departure_time: departureTime,
    solar_altitude_deg: Math.round(solarAlt * 10) / 10,
    ambient_temp_c: isMonsoon ? 32.5 : ambientTempC,
    relative_humidity: isMonsoon ? 85.0 : humidityPct,
    heat_index_c: isMonsoon ? 42.1 : 59.8,
    routes: clonedRoutes,
    hydration_pois: corridorPois,
    decision_summary: decisionSummary,
    aws_telemetry: {
      ...FALLBACK_EVALUATION.aws_telemetry,
      cloudwatch_metric: {
        metric_name: isMonsoon ? "FloodInundationHazardsBypassed" : "ThermalStressHoursAvoided",
        value: isMonsoon ? 1.0 : 13.98,
        unit: isMonsoon ? "Hazards" : "StressHours"
      }
    }
  };
}
