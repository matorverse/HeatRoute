/**
 * Pre-computed deterministic fallback dataset for HeatRoute.
 * Guarantees that the demo NEVER breaks even during network drops or API downtime.
 */

export const FALLBACK_CORRIDOR = {
  corridor_id: "DELHI_CP_TO_MANDI_HOUSE",
  name: "Rajiv Chowk (Connaught Place) to Mandi House Metro Hub",
  city: "New Delhi",
  origin: {
    name: "Rajiv Chowk Metro Station (Gate 2)",
    coordinates: [77.2195, 28.6328]
  },
  destination: {
    name: "Mandi House Metro Interchange",
    coordinates: [77.2345, 28.6258]
  }
};

export const FALLBACK_HYDRATION_POIS = [
  {
    id: "poi-bangla-sahib-chhabil",
    name: "Gurudwara Bangla Sahib Cold Water Chhabil",
    type: "FREE_COMMUNITY_WATER",
    coordinates: [77.2091, 28.6261],
    verified_status: "VERIFIED_ACTIVE",
    features: ["Chilled RO Water", "Shaded Seating", "High Capacity", "First-Aid Station"],
    accessibility: "Open 24x7 to public",
    last_verified_hours_ago: 1.2
  },
  {
    id: "poi-rajiv-chowk-gate2",
    name: "Rajiv Chowk Metro Gate 2 Water Kiosk",
    type: "METRO_WATER_ATM",
    coordinates: [77.2195, 28.6328],
    verified_status: "VERIFIED_ACTIVE",
    features: ["Filtered RO Water", "Air-Cooled Concourse Entry", "Accessible"],
    accessibility: "06:00 - 23:00",
    last_verified_hours_ago: 0.5
  },
  {
    id: "poi-djb-kg-marg",
    name: "Delhi Jal Board (DJB) Public Water Post",
    type: "MUNICIPAL_WATER_POINT",
    coordinates: [77.2235, 28.6280],
    verified_status: "VERIFIED_ACTIVE",
    features: ["Municipal Potable Tap", "Tree Canopy Rest Area"],
    accessibility: "Open daylight hours",
    last_verified_hours_ago: 3.0
  },
  {
    id: "poi-barakhamba-metro",
    name: "Barakhamba Road Metro Hydration Facility",
    type: "METRO_WATER_ATM",
    coordinates: [77.2260, 28.6295],
    verified_status: "VERIFIED_ACTIVE",
    features: ["Clean Drinking Water", "Underground Cooling Refuge"],
    accessibility: "06:00 - 23:00",
    last_verified_hours_ago: 2.1
  },
  {
    id: "poi-central-park-pavilion",
    name: "Central Park Shaded Cooling Pavilion",
    type: "SHADED_REST_POINT",
    coordinates: [77.2185, 28.6325],
    verified_status: "VERIFIED_ACTIVE",
    features: ["Pergola Shade", "Water Misting Fountain", "Benches", "Lush Lawn"],
    accessibility: "06:00 - 21:00",
    last_verified_hours_ago: 4.0
  },
  {
    id: "poi-mandi-house-gate2",
    name: "Mandi House Metro Drinking Water Facility",
    type: "METRO_WATER_ATM",
    coordinates: [77.2345, 28.6258],
    verified_status: "VERIFIED_ACTIVE",
    features: ["Chilled Drinking Water", "Public Restrooms"],
    accessibility: "06:00 - 23:00",
    last_verified_hours_ago: 1.0
  },
  {
    id: "poi-tolstoy-cooler",
    name: "Tolstoy Marg Community Water Cooler (Pyaau)",
    type: "COMMUNITY_PYAAU",
    coordinates: [77.2285, 28.6254],
    verified_status: "VERIFIED_ACTIVE",
    features: ["Earthen Pot (Matka) & Electric Chiller", "Tree Shade"],
    accessibility: "Open daylight hours",
    last_verified_hours_ago: 2.5
  }
];

export const FALLBACK_EVALUATION = {
  status: "SUCCESS",
  corridor_name: "Rajiv Chowk (Connaught Place) to Mandi House Metro Hub",
  departure_time: "2026-06-15T13:30:00+05:30",
  solar_altitude_deg: 73.6,
  solar_azimuth_deg: 285.1,
  ambient_temp_c: 43.5,
  relative_humidity: 42.0,
  heat_index_c: 59.8,
  decision_summary: "At 01:30 PM (Sun Altitude: 73.6°), the Coolest Route cuts 31.9% estimated thermal exposure for a modest +25% (+5.4 min) walk through covered colonnades.",
  aws_telemetry: {
    aws_region: "ap-south-1 (Mumbai)",
    lambda_request_id: "heatroute-req-fallback-prod",
    cloudwatch_metric: {
      metric_name: "ThermalStressHoursAvoided",
      value: 13.98,
      unit: "StressHours"
    },
    dynamodb_queried_pois: 7,
    execution_latency_ms: 18.4
  },
  hydration_pois: FALLBACK_HYDRATION_POIS,
  routes: [
    {
      id: "route-direct-barakhamba",
      name: "Barakhamba Road Direct",
      mode: "FASTEST",
      is_recommended: false,
      description: "Shortest direct arterial path. Minimal street trees, wide blacktop asphalt, high unshielded solar insolation during midday.",
      total_length_m: 1540,
      total_duration_min: 21.4,
      detour_percent: 0.0,
      raw_exposure_score: 877.3,
      exposure_label: "HIGH",
      exposure_color: "#EF4444",
      exposure_reduction_pct: 0.0,
      avg_shade_percentage: 15.2,
      safety: {
        passed_safety_filter: true,
        safety_verdict: "VERIFIED_SAFE",
        safety_score: 0.90,
        violations: []
      },
      contributing_factors: [
        "High direct solar exposure with minimal tree or building shade",
        "Prolonged walking on wide blacktop asphalt radiating ambient heat"
      ],
      confidence: "HIGH",
      path_coordinates: [
        [77.2195, 28.6328],
        [77.2215, 28.6320],
        [77.2248, 28.6305],
        [77.2285, 28.6288],
        [77.2318, 28.6272],
        [77.2345, 28.6258]
      ],
      segments: [
        {
          name: "Outer Circle Crossing",
          length_m: 220,
          duration_min: 3.1,
          surface_type: "asphalt",
          effective_shade: 0.10,
          shade_source: "urban_geometry",
          thermal_intensity_rate: 42.1,
          segment_exposure_score: 130.5,
          start_coords: [77.2195, 28.6328],
          end_coords: [77.2215, 28.6320]
        },
        {
          name: "Barakhamba North",
          length_m: 410,
          duration_min: 5.7,
          surface_type: "asphalt",
          effective_shade: 0.16,
          shade_source: "urban_geometry",
          thermal_intensity_rate: 41.2,
          segment_exposure_score: 234.8,
          start_coords: [77.2215, 28.6320],
          end_coords: [77.2248, 28.6305]
        },
        {
          name: "Barakhamba Commercial Tower Corridor",
          length_m: 460,
          duration_min: 6.4,
          surface_type: "asphalt",
          effective_shade: 0.14,
          shade_source: "urban_geometry",
          thermal_intensity_rate: 41.8,
          segment_exposure_score: 267.5,
          start_coords: [77.2248, 28.6305],
          end_coords: [77.2285, 28.6288]
        },
        {
          name: "Barakhamba Approach to Mandi House",
          length_m: 450,
          duration_min: 6.2,
          surface_type: "asphalt",
          effective_shade: 0.20,
          shade_source: "urban_geometry",
          thermal_intensity_rate: 39.5,
          segment_exposure_score: 244.5,
          start_coords: [77.2285, 28.6288],
          end_coords: [77.2345, 28.6258]
        }
      ]
    },
    {
      id: "route-canopy-kg-marg",
      name: "Kasturba Gandhi Marg Tree Avenue",
      mode: "BALANCED",
      is_recommended: true,
      description: "Follows KG Marg lined with mature heritage Neem and Peepal tree canopies, connecting via Tolstoy Marg.",
      total_length_m: 1780,
      total_duration_min: 24.7,
      detour_percent: 15.4,
      raw_exposure_score: 667.5,
      exposure_label: "MODERATE",
      exposure_color: "#F59E0B",
      exposure_reduction_pct: 23.9,
      avg_shade_percentage: 68.4,
      safety: {
        passed_safety_filter: true,
        safety_verdict: "VERIFIED_SAFE",
        safety_score: 0.95,
        violations: []
      },
      contributing_factors: [
        "Dense canopy from heritage avenue trees shields pedestrians from direct solar rays",
        "Continuous segregated concrete footpaths"
      ],
      confidence: "HIGH",
      path_coordinates: [
        [77.2195, 28.6328],
        [77.2210, 28.6315],
        [77.2235, 28.6280],
        [77.2260, 28.6250],
        [77.2305, 28.6254],
        [77.2345, 28.6258]
      ],
      segments: [
        {
          name: "KG Radial Link",
          length_m: 210,
          duration_min: 2.9,
          surface_type: "concrete",
          effective_shade: 0.35,
          shade_source: "canopy_and_canyon",
          thermal_intensity_rate: 34.2,
          segment_exposure_score: 99.2,
          start_coords: [77.2195, 28.6328],
          end_coords: [77.2210, 28.6315]
        },
        {
          name: "KG Marg Tree Avenue (North)",
          length_m: 480,
          duration_min: 6.7,
          surface_type: "concrete",
          effective_shade: 0.75,
          shade_source: "canopy_and_canyon",
          thermal_intensity_rate: 25.1,
          segment_exposure_score: 168.2,
          start_coords: [77.2210, 28.6315],
          end_coords: [77.2235, 28.6280]
        },
        {
          name: "KG Marg Heritage Canopy Stretch",
          length_m: 420,
          duration_min: 5.8,
          surface_type: "concrete",
          effective_shade: 0.80,
          shade_source: "canopy_and_canyon",
          thermal_intensity_rate: 23.8,
          segment_exposure_score: 138.0,
          start_coords: [77.2235, 28.6280],
          end_coords: [77.2260, 28.6250]
        },
        {
          name: "Tolstoy Marg Shaded Walkway",
          length_m: 670,
          duration_min: 9.3,
          surface_type: "mixed",
          effective_shade: 0.65,
          shade_source: "canopy_and_canyon",
          thermal_intensity_rate: 28.2,
          segment_exposure_score: 262.1,
          start_coords: [77.2260, 28.6250],
          end_coords: [77.2345, 28.6258]
        }
      ]
    },
    {
      id: "route-colonnade-coolest",
      name: "CP Colonnade Arcade & Shaded Lane",
      mode: "COOLEST",
      is_recommended: false,
      description: "Utilizes 100% covered pedestrian colonnade arcades in Connaught Place, transitioning through tree-shaded School Lane and Babar Road.",
      total_length_m: 1920,
      total_duration_min: 26.8,
      detour_percent: 25.2,
      raw_exposure_score: 597.7,
      exposure_label: "MODERATE",
      exposure_color: "#10B981",
      exposure_reduction_pct: 31.9,
      avg_shade_percentage: 84.6,
      safety: {
        passed_safety_filter: true,
        safety_verdict: "VERIFIED_SAFE",
        safety_score: 0.98,
        violations: []
      },
      contributing_factors: [
        "Zero direct solar insolation along covered Connaught Place arcades",
        "Cooler paver and vegetated ground surfaces prevent thermal radiation"
      ],
      confidence: "HIGH",
      path_coordinates: [
        [77.2195, 28.6328],
        [77.2180, 28.6315],
        [77.2198, 28.6290],
        [77.2225, 28.6270],
        [77.2270, 28.6265],
        [77.2310, 28.6260],
        [77.2345, 28.6258]
      ],
      segments: [
        {
          name: "Inner Circle Covered Colonnade",
          length_m: 350,
          duration_min: 4.9,
          surface_type: "paver_colonnade",
          effective_shade: 0.98,
          shade_source: "colonnade_arcade",
          thermal_intensity_rate: 19.8,
          segment_exposure_score: 97.0,
          start_coords: [77.2195, 28.6328],
          end_coords: [77.2180, 28.6315]
        },
        {
          name: "Janpath Covered Arcade Link",
          length_m: 310,
          duration_min: 4.3,
          surface_type: "paver_colonnade",
          effective_shade: 0.98,
          shade_source: "colonnade_arcade",
          thermal_intensity_rate: 19.8,
          segment_exposure_score: 85.1,
          start_coords: [77.2180, 28.6315],
          end_coords: [77.2198, 28.6290]
        },
        {
          name: "Atul Grove Shaded Lane",
          length_m: 380,
          duration_min: 5.3,
          surface_type: "vegetated",
          effective_shade: 0.85,
          shade_source: "canopy_and_canyon",
          thermal_intensity_rate: 21.5,
          segment_exposure_score: 114.0,
          start_coords: [77.2198, 28.6290],
          end_coords: [77.2225, 28.6270]
        },
        {
          name: "School Lane Green Belt",
          length_m: 480,
          duration_min: 6.7,
          surface_type: "vegetated",
          effective_shade: 0.80,
          shade_source: "canopy_and_canyon",
          thermal_intensity_rate: 22.8,
          segment_exposure_score: 152.8,
          start_coords: [77.2225, 28.6270],
          end_coords: [77.2270, 28.6265]
        },
        {
          name: "Babar Road Approach",
          length_m: 400,
          duration_min: 5.6,
          surface_type: "concrete",
          effective_shade: 0.70,
          shade_source: "canopy_and_canyon",
          thermal_intensity_rate: 26.5,
          segment_exposure_score: 148.8,
          start_coords: [77.2270, 28.6265],
          end_coords: [77.2345, 28.6258]
        }
      ]
    },
    {
      id: "route-unsafe-flyover-shortcut",
      name: "Vehicular Flyover Expressway Shortcut",
      mode: "REJECTED_UNSAFE",
      is_recommended: false,
      description: "High-speed vehicular flyover bypass without pedestrian footpaths. Disqualified by Phase 1 Safety Filter.",
      total_length_m: 1420,
      total_duration_min: 14.2,
      detour_percent: 0.0,
      raw_exposure_score: 999.0,
      exposure_label: "HIGH",
      exposure_color: "#6B7280",
      exposure_reduction_pct: 0.0,
      avg_shade_percentage: 0.0,
      safety: {
        passed_safety_filter: false,
        safety_verdict: "REJECTED_UNSAFE",
        safety_score: 0.0,
        violations: [
          "Segment 1 (Barakhamba Elevated Flyover Ramp): Prohibited pedestrian highway classification: flyover",
          "Segment 2 (Expressway Descent): No pedestrian refuge island at high-speed interchange"
        ]
      },
      contributing_factors: [
        "FAILED SAFETY FILTER: Prohibited pedestrian highway classification: flyover"
      ],
      confidence: "HIGH",
      path_coordinates: [
        [77.2195, 28.6328],
        [77.2250, 28.6310],
        [77.2345, 28.6258]
      ],
      segments: []
    }
  ]
};
