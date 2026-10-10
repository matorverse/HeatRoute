/**
 * HeatRoute API Service
 * Dual-Mode: Seamlessly connects to live AWS / local FastAPI backend,
 * with deterministic in-browser calculation fallback so demos NEVER fail.
 */

import { 
  FALLBACK_CORRIDORS, 
  FALLBACK_EVALUATION, 
  FALLBACK_HYDRATION_POIS,
  FALLBACK_ROUTES_BY_CORRIDOR 
} from "../data/fallbackData";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? (import.meta.env.PROD ? "" : "http://127.0.0.1:8000");

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
    origin = null,
    destination = null,
    pitstopPoiId = null
  } = params;

  const targetCorridor = FALLBACK_CORRIDORS.find(c => c.id === corridorId) || FALLBACK_CORRIDORS[0];
  const originCoords = origin || targetCorridor.origin.coordinates;
  const destCoords = destination || targetCorridor.destination.coordinates;

  const cacheKey = `${corridorId}_${season}_${pitstopPoiId || "none"}_${originCoords.join(",")}_${destCoords.join(",")}_${departureTime}_${ambientTempC}_${humidityPct}_${modePreference}`;
  if (evaluationCache.has(cacheKey)) {
    return evaluationCache.get(cacheKey);
  }

  let result = null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8.0s timeout to allow OSRM street network query

    const res = await fetch(`${BACKEND_URL}/api/v1/routes/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        origin: originCoords,
        destination: destCoords,
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
    result = await simulateDynamicEvaluation({
      departureTime,
      ambientTempC,
      humidityPct,
      modePreference,
      season,
      corridorId,
      origin: originCoords,
      destination: destCoords,
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
 * Client-side OSRM fetcher for true road-snapped polylines
 */
async function fetchClientOsrm(waypoints) {
  try {
    const pts = waypoints.map(p => `${p[0]},${p[1]}`).join(";");
    const res = await fetch(`https://router.project-osrm.org/route/v1/foot/${pts}?overview=full&geometries=geojson`);
    if (res.ok) {
      const data = await res.json();
      if (data.code === "Ok" && data.routes?.[0]?.geometry?.coordinates?.length >= 4) {
        return data.routes[0].geometry.coordinates;
      }
    }
  } catch (e) {
    // offline or blocked
  }
  return null;
}

/**
 * Stepwise Manhattan block generator to follow street corridors when offline
 */
function generateOrthogonalStreetPath(o, d, detourOffset = 0) {
  const [lon1, lat1] = o;
  const [lon2, lat2] = d;
  const dLon = lon2 - lon1;
  const dLat = lat2 - lat1;
  const numSteps = 8;
  const coords = [o];
  for (let i = 1; i < numSteps; i++) {
    const t = i / numSteps;
    const perp = Math.sin(t * Math.PI) * detourOffset;
    const perpLon = -dLat * perp;
    const perpLat = dLon * perp;
    if (i % 2 === 1) {
      coords.push([Number((lon1 + dLon * t + perpLon).toFixed(6)), Number((lat1 + dLat * (t - 0.5 / numSteps) + perpLat).toFixed(6))]);
    } else {
      coords.push([Number((lon1 + dLon * t + perpLon).toFixed(6)), Number((lat1 + dLat * t + perpLat).toFixed(6))]);
    }
  }
  coords.push(d);
  return coords;
}

/**
 * Calculates in-browser dynamic solar, monsoon hazard, and exposure shifts
 */
async function simulateDynamicEvaluation({
  departureTime,
  ambientTempC,
  humidityPct,
  modePreference,
  season,
  corridorId,
  origin,
  destination,
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
  const activeCorridorId = corridorId || "DELHI_CP_TO_MANDI_HOUSE";
  const corridorPois = FALLBACK_HYDRATION_POIS.filter(
    p => p.corridor_id === activeCorridorId
  );

  const matchedPoi = pitstopPoiId ? FALLBACK_HYDRATION_POIS.find(p => p.id === pitstopPoiId) : null;

  // Retrieve base candidate routes for this specific corridor
  let rawBaseRoutes = FALLBACK_ROUTES_BY_CORRIDOR[activeCorridorId];
  if (!rawBaseRoutes && origin && destination) {
    const o = origin;
    const d = destination;

    // Try online pedestrian OSRM query
    let p1 = await fetchClientOsrm([o, d]);
    if (!p1) p1 = generateOrthogonalStreetPath(o, d, 0.0);

    const midLon = (o[0] + d[0]) / 2;
    const midLat = (o[1] + d[1]) / 2;
    const perpLon = -(d[1] - o[1]) * 0.25;
    const perpLat = (d[0] - o[0]) * 0.25;

    let p2 = await fetchClientOsrm([o, [midLon + perpLon, midLat + perpLat], d]);
    if (!p2) p2 = generateOrthogonalStreetPath(o, d, 0.25);

    let p3 = await fetchClientOsrm([o, [midLon - perpLon * 0.6, midLat - perpLat * 0.6], d]);
    if (!p3) p3 = generateOrthogonalStreetPath(o, d, -0.15);

    rawBaseRoutes = [
      {
        id: "custom-direct-route",
        name: "Direct Arterial Path",
        mode: "FASTEST",
        is_recommended: false,
        total_length_m: 1200,
        total_duration_min: 15.0,
        raw_exposure_score: 820.0,
        exposure_label: "HIGH",
        exposure_color: "#EF4444",
        exposure_reduction_pct: 0.0,
        avg_shade_percentage: 16.0,
        path_coordinates: p1,
        steps: [
          { step_num: 1, instruction: "Depart origin along street sidewalk", distance_m: 400, shade_info: "12% shade" },
          { step_num: 2, instruction: "Continue on primary commercial strip", distance_m: 400, shade_info: "15% tree cover" },
          { step_num: 3, instruction: "Arrive at destination point", distance_m: 400, shade_info: "Approaching destination" }
        ]
      },
      {
        id: "custom-canopy-route",
        name: "Canopy & Shaded Boulevard",
        mode: "COOLEST",
        is_recommended: true,
        total_length_m: 1380,
        total_duration_min: 17.5,
        raw_exposure_score: 460.0,
        exposure_label: "LOW",
        exposure_color: "#10B981",
        exposure_reduction_pct: 35.5,
        avg_shade_percentage: 84.0,
        path_coordinates: p2,
        steps: [
          { step_num: 1, instruction: "Turn into shaded tree-lined avenue", distance_m: 450, shade_info: "Dense canopy (80%)" },
          { step_num: 2, instruction: "Proceed through covered walkway and park", distance_m: 550, shade_info: "Continuous shade (85%)" },
          { step_num: 3, instruction: "Reach destination safely", distance_m: 380, shade_info: "Protected tree cover" }
        ]
      },
      {
        id: "custom-balanced-route",
        name: "Balanced Shaded Sidewalks",
        mode: "BALANCED",
        is_recommended: false,
        total_length_m: 1280,
        total_duration_min: 16.2,
        raw_exposure_score: 590.0,
        exposure_label: "MODERATE",
        exposure_color: "#F59E0B",
        exposure_reduction_pct: 20.0,
        avg_shade_percentage: 52.0,
        path_coordinates: p3,
        steps: [
          { step_num: 1, instruction: "Follow secondary street with sidewalk trees", distance_m: 640, shade_info: "52% shade" },
          { step_num: 2, instruction: "Proceed to destination", distance_m: 640, shade_info: "48% shade" }
        ]
      }
    ];
  } else if (!rawBaseRoutes) {
    rawBaseRoutes = FALLBACK_ROUTES_BY_CORRIDOR.DELHI_CP_TO_MANDI_HOUSE;
  }
  let clonedRoutes = rawBaseRoutes.map(r => ({
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
      if (route.id === "route-colonnade-coolest" || route.id === "route-iit-sda-arcade" || route.id === "route-cc-dariba-haveli") {
        return {
          ...route,
          mode: "SAFEST_DRY",
          is_recommended: true,
          exposure_label: "LOW",
          exposure_color: "#10B981"
        };
      }
      return route;
    });
  } else {
    // SUMMER HEAT ENGINE
    clonedRoutes.forEach(route => {
      if (route.mode === "REJECTED_UNSAFE") return;

      if (route.id === "route-direct-barakhamba" || route.id === "route-iit-outer-ring" || route.id === "route-cc-netaji-subhash") {
        if (isLateAfternoon) {
          route.avg_shade_percentage = 58.0;
          route.raw_exposure_score = 485.4;
          route.exposure_label = "LOW";
          route.exposure_color = "#10B981";
        } else if (isMorning) {
          route.avg_shade_percentage = 42.0;
          route.raw_exposure_score = 590.2;
          route.exposure_label = "MODERATE";
          route.exposure_color = "#F59E0B";
        } else {
          route.avg_shade_percentage = 18.0;
          route.raw_exposure_score = 860.0;
          route.exposure_label = "HIGH";
          route.exposure_color = "#EF4444";
        }
      }
    });

    const fastest = clonedRoutes.find(r => r.mode === "FASTEST" && r.mode !== "REJECTED_UNSAFE") ||
                    clonedRoutes.find(r => r.mode !== "REJECTED_UNSAFE");
    
    if (fastest) {
      clonedRoutes.forEach(r => {
        if (r.mode !== "REJECTED_UNSAFE") {
          const saved = ((fastest.raw_exposure_score - r.raw_exposure_score) / Math.max(0.1, fastest.raw_exposure_score)) * 100;
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

  const activeCorridor = FALLBACK_CORRIDORS.find(c => c.id === activeCorridorId) || FALLBACK_CORRIDORS[0];
  const timeFormatted = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  let decisionSummary = "";
  const pitstopNote = matchedPoi ? ` (Includes hydration waypoint at ${matchedPoi.name})` : "";

  const recommendedRoute = clonedRoutes.find(r => r.is_recommended) || clonedRoutes[0];

  if (isMonsoon) {
    const floodWarning = clonedRoutes.some(r => r.id === "route-minto-underpass" && r.mode === "REJECTED_UNSAFE")
      ? " ⚠️ Minto Sunken Underpass disqualified (1.8m flood hazard)."
      : "";
    decisionSummary = `⛈️ Monsoon Downpour Advisory (${timeFormatted}): ${recommendedRoute?.name} recommended for covered rain shelters and zero standing water.${floodWarning}${pitstopNote}`;
  } else if (isLateAfternoon) {
    decisionSummary = `☀️ Heatwave Advisory (${timeFormatted}, Sun Altitude: ${Math.round(solarAlt)}°): Lengthening building shadows provide improved thermal protection along ${activeCorridor.name}.${pitstopNote}`;
  } else {
    decisionSummary = `☀️ Heatwave Advisory (${timeFormatted}, Sun Altitude: ${Math.round(solarAlt)}°): ${recommendedRoute?.name} cuts thermal radiant load under protected urban canopies.${pitstopNote}`;
  }

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
