/**
 * Pre-computed deterministic fallback dataset for HeatRoute.
 * Guarantees that the demo NEVER breaks even during network drops or API downtime.
 */

export const FALLBACK_CORRIDORS = [
  {
    id: "DELHI_CP_TO_MANDI_HOUSE",
    name: "Connaught Place ➔ Mandi House",
    city: "New Delhi",
    origin: {
      name: "Rajiv Chowk Metro (Gate 2)",
      coordinates: [77.2195, 28.6328]
    },
    destination: {
      name: "Mandi House Metro Hub",
      coordinates: [77.2345, 28.6258]
    },
    default_zoom: 14.5
  },
  {
    id: "DELHI_HAUZ_KHAS_TO_IIT",
    name: "Hauz Khas Metro ➔ IIT Delhi Gate",
    city: "South Delhi",
    origin: {
      name: "Hauz Khas Metro (Gate 3)",
      coordinates: [77.2065, 28.5432]
    },
    destination: {
      name: "IIT Delhi Main Gate",
      coordinates: [77.1925, 28.5450]
    },
    default_zoom: 14.5
  },
  {
    id: "DELHI_CHANDNI_CHOWK",
    name: "Chandni Chowk ➔ Red Fort Heritage Walk",
    city: "Old Delhi",
    origin: {
      name: "Chandni Chowk Metro (Gate 1)",
      coordinates: [77.2285, 28.6575]
    },
    destination: {
      name: "Red Fort (Lahori Gate)",
      coordinates: [77.2410, 28.6560]
    },
    default_zoom: 15.0
  }
];

export const FALLBACK_CORRIDOR = FALLBACK_CORRIDORS[0];

export const FALLBACK_HYDRATION_POIS = [
  {
    id: "poi-bangla-sahib-chhabil",
    corridor_id: "DELHI_CP_TO_MANDI_HOUSE",
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
    corridor_id: "DELHI_CP_TO_MANDI_HOUSE",
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
    corridor_id: "DELHI_CP_TO_MANDI_HOUSE",
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
    corridor_id: "DELHI_CP_TO_MANDI_HOUSE",
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
    corridor_id: "DELHI_CP_TO_MANDI_HOUSE",
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
    corridor_id: "DELHI_CP_TO_MANDI_HOUSE",
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
    corridor_id: "DELHI_CP_TO_MANDI_HOUSE",
    name: "Tolstoy Marg Community Water Cooler (Pyaau)",
    type: "COMMUNITY_PYAAU",
    coordinates: [77.2285, 28.6254],
    verified_status: "VERIFIED_ACTIVE",
    features: ["Earthen Pot (Matka) & Electric Chiller", "Tree Shade"],
    accessibility: "Open daylight hours",
    last_verified_hours_ago: 2.5
  },
  {
    id: "poi-hk-metro-gate3",
    corridor_id: "DELHI_HAUZ_KHAS_TO_IIT",
    name: "Hauz Khas Metro Gate 3 Water ATM",
    type: "METRO_WATER_ATM",
    coordinates: [77.2060, 28.5430],
    verified_status: "VERIFIED_ACTIVE",
    features: ["Chilled RO Dispenser", "AC Subway Shelter"],
    accessibility: "06:00 - 23:00",
    last_verified_hours_ago: 0.8
  },
  {
    id: "poi-sda-market-pyaau",
    corridor_id: "DELHI_HAUZ_KHAS_TO_IIT",
    name: "SDA Commercial Market Public Cooler",
    type: "COMMUNITY_PYAAU",
    coordinates: [77.1990, 28.5445],
    verified_status: "VERIFIED_ACTIVE",
    features: ["Deep Shaded Awnings", "Filtered Drinking Water", "Benches"],
    accessibility: "Open daylight hours",
    last_verified_hours_ago: 1.5
  },
  {
    id: "poi-iit-gate-kiosk",
    corridor_id: "DELHI_HAUZ_KHAS_TO_IIT",
    name: "IIT Delhi Main Gate Hydration Kiosk",
    type: "FREE_COMMUNITY_WATER",
    coordinates: [77.1930, 28.5452],
    verified_status: "VERIFIED_ACTIVE",
    features: ["Cold RO Water", "Bus Shelter Cover", "Guard Station"],
    accessibility: "Open 24x7 to public",
    last_verified_hours_ago: 1.1
  },
  {
    id: "poi-sis-ganj-chhabil",
    corridor_id: "DELHI_CHANDNI_CHOWK",
    name: "Gurudwara Sis Ganj Sahib Chhabil",
    type: "FREE_COMMUNITY_WATER",
    coordinates: [77.2325, 28.6568],
    verified_status: "VERIFIED_ACTIVE",
    features: ["Chilled Rose Sharbat & Water", "Marble Shade Hall", "Open to All"],
    accessibility: "Open 24x7 to public",
    last_verified_hours_ago: 0.3
  },
  {
    id: "poi-cc-metro-gate1",
    corridor_id: "DELHI_CHANDNI_CHOWK",
    name: "Chandni Chowk Metro Concourse Hydration Point",
    type: "METRO_WATER_ATM",
    coordinates: [77.2288, 28.6573],
    verified_status: "VERIFIED_ACTIVE",
    features: ["RO Water ATM", "Air-conditioned Subsurface Shelter"],
    accessibility: "06:00 - 23:00",
    last_verified_hours_ago: 1.2
  },
  {
    id: "poi-redfort-plaza-cooler",
    corridor_id: "DELHI_CHANDNI_CHOWK",
    name: "Red Fort Plaza Tourist Drinking Fountain",
    type: "MUNICIPAL_WATER_POINT",
    coordinates: [77.2405, 28.6562],
    verified_status: "VERIFIED_ACTIVE",
    features: ["Filtered Water Fountains", "Large Shaded Canopy", "Security"],
    accessibility: "08:00 - 21:00",
    last_verified_hours_ago: 2.0
  }
];

// Fallback candidate routes grouped by corridor
export const FALLBACK_ROUTES_BY_CORRIDOR = {
  DELHI_CP_TO_MANDI_HOUSE: [
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
      waterlogging_risk: "MODERATE_PUDDLES",
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
      steps: [
        {
          step_num: 1,
          instruction: "Exit Rajiv Chowk Gate 2 and head east across Outer Circle",
          distance_m: 220,
          shade_info: "Low shade (10%), open asphalt crossing",
          water_nearby: "Rajiv Chowk Metro Water ATM at origin"
        },
        {
          step_num: 2,
          instruction: "Continue straight along Barakhamba Road northern commercial strip",
          distance_m: 410,
          shade_info: "15% tree cover, intermittent tower shadow",
          water_nearby: "Barakhamba Metro Hydration Facility (100m south)"
        },
        {
          step_num: 3,
          instruction: "Walk past high-rise office towers towards Copernicus Marg crossing",
          distance_m: 460,
          shade_info: "12% canopy cover, asphalt radiates intense heat",
          water_nearby: null
        },
        {
          step_num: 4,
          instruction: "Approach Mandi House roundabout via eastern pedestrian sidewalk",
          distance_m: 450,
          shade_info: "20% building shade near roundabout",
          water_nearby: "Mandi House Gate 2 Metro Water Facility at destination"
        }
      ],
      segments: []
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
      waterlogging_risk: "LOW",
      safety: {
        passed_safety_filter: true,
        safety_verdict: "VERIFIED_SAFE",
        safety_score: 0.95,
        violations: []
      },
      contributing_factors: [
        "Continuous heritage canopy shade reduces solar radiant load by 55%",
        "Cooler paver sidewalks significantly attenuate ground re-radiation"
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
      steps: [
        {
          step_num: 1,
          instruction: "Walk south from Rajiv Chowk into KG Marg radial link",
          distance_m: 210,
          shade_info: "35% shade from ornamental roadside trees",
          water_nearby: "Central Park Shaded Pavilion (150m west)"
        },
        {
          step_num: 2,
          instruction: "Follow wide pedestrian sidewalk under mature heritage Neem canopy",
          distance_m: 480,
          shade_info: "75% deep tree canopy cover",
          water_nearby: "DJB Public Water Post at KG Marg"
        },
        {
          step_num: 3,
          instruction: "Continue past British Council along shaded heritage boulevard",
          distance_m: 420,
          shade_info: "80% continuous overhead leaf cover",
          water_nearby: null
        },
        {
          step_num: 4,
          instruction: "Turn left onto Tolstoy Marg tree-lined walkway leading to Mandi House",
          distance_m: 670,
          shade_info: "65% canopy cover, comfortable ambient microclimate",
          water_nearby: "Tolstoy Marg Community Water Cooler (Pyaau)"
        }
      ],
      segments: []
    },
    {
      id: "route-colonnade-coolest",
      name: "CP Colonnade Arcade & Shaded Lane",
      mode: "COOLEST",
      is_recommended: false,
      description: "Utilizes 100% covered pedestrian colonnade arcades in Connaught Place, transitioning through tree-shaded School Lane. 100% rain and sun protected.",
      total_length_m: 1920,
      total_duration_min: 26.8,
      detour_percent: 25.2,
      raw_exposure_score: 597.7,
      exposure_label: "LOW",
      exposure_color: "#10B981",
      exposure_reduction_pct: 31.9,
      avg_shade_percentage: 84.6,
      waterlogging_risk: "NONE",
      safety: {
        passed_safety_filter: true,
        safety_verdict: "VERIFIED_SAFE",
        safety_score: 0.98,
        violations: []
      },
      contributing_factors: [
        "100% structural colonnade roof completely eliminates direct solar insolation",
        "Deep garden canopies along Atul Grove maintain low radiant ground temperature",
        "Zero puddle formation / rainproof pedestrian arcades"
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
      steps: [
        {
          step_num: 1,
          instruction: "Enter Inner Circle covered colonnade corridor at Block B",
          distance_m: 350,
          shade_info: "100% full structural colonnade roof, zero direct solar radiation & fully rain protected",
          water_nearby: "Rajiv Chowk Metro Water ATM"
        },
        {
          step_num: 2,
          instruction: "Navigate through covered Janpath arcade shopping verandas",
          distance_m: 310,
          shade_info: "100% covered architectural walkway, paver surface",
          water_nearby: "Janpath Tourist Information Water Kiosk"
        },
        {
          step_num: 3,
          instruction: "Turn into Atul Grove shaded pedestrian lane with dense canopy",
          distance_m: 380,
          shade_info: "85% dense tree canopy, tranquil residential street",
          water_nearby: null
        },
        {
          step_num: 4,
          instruction: "Walk through School Lane green corridor",
          distance_m: 480,
          shade_info: "80% tree shade, low traffic surface",
          water_nearby: "Tolstoy Marg Community Cooler nearby"
        },
        {
          step_num: 5,
          instruction: "Reach Mandi House via Babar Road shaded approach",
          distance_m: 400,
          shade_info: "70% shade from residential gardens and neem trees",
          water_nearby: "Mandi House Gate 2 Metro Hydration Point"
        }
      ],
      segments: []
    },
    {
      id: "route-minto-underpass",
      name: "Minto Road Sunken Railway Underpass",
      mode: "FASTEST",
      is_recommended: false,
      description: "Sunken railway subway cutting directly towards Mandi House. Fast shortcut in dry weather, but notoriously submerges up to 1.8m during monsoon downpours.",
      total_length_m: 1280,
      total_duration_min: 17.8,
      detour_percent: 0.0,
      raw_exposure_score: 715.7,
      exposure_label: "MODERATE",
      exposure_color: "#F59E0B",
      exposure_reduction_pct: 0.0,
      avg_shade_percentage: 28.0,
      waterlogging_risk: "SEVERE_SUBMERGED",
      safety: {
        passed_safety_filter: true,
        safety_verdict: "VERIFIED_SAFE",
        safety_score: 0.85,
        violations: []
      },
      contributing_factors: [
        "Direct railway underpass shortcut",
        "Submerged drainage hazard in monsoon"
      ],
      confidence: "HIGH",
      path_coordinates: [
        [77.2195, 28.6328],
        [77.2220, 28.6345],
        [77.2265, 28.6330],
        [77.2310, 28.6295],
        [77.2345, 28.6258]
      ],
      steps: [
        {
          step_num: 1,
          instruction: "Head northeast towards Minto Road railway approach",
          distance_m: 350,
          shade_info: "Low shade, open road",
          water_nearby: null
        },
        {
          step_num: 2,
          instruction: "Descend into Minto Road sunken railway underpass",
          distance_m: 480,
          shade_info: "Concrete underpass walls; EXTREME FLOOD RISK IN MONSOON (depth > 1.5m)",
          water_nearby: "Submerged drainage trap"
        },
        {
          step_num: 3,
          instruction: "Ascend and emerge towards Deen Dayal Upadhyaya Marg to Mandi House",
          distance_m: 450,
          shade_info: "Moderate tree cover on sidewalk",
          water_nearby: null
        }
      ],
      segments: []
    },
    {
      id: "route-unsafe-flyover-shortcut",
      name: "Vehicular Flyover Expressway Shortcut",
      mode: "REJECTED_UNSAFE",
      is_recommended: false,
      description: "Vehicular expressway bypass without pedestrian footpath. Explicitly rejected by pedestrian safety constraints.",
      total_length_m: 1420,
      total_duration_min: 14.2,
      detour_percent: 0.0,
      raw_exposure_score: 999.0,
      exposure_label: "HIGH",
      exposure_color: "#9CA3AF",
      exposure_reduction_pct: 0.0,
      avg_shade_percentage: 0.0,
      waterlogging_risk: "NONE",
      safety: {
        passed_safety_filter: false,
        safety_verdict: "REJECTED_UNSAFE",
        safety_score: 0.0,
        violations: [
          "Segment 1 (Barakhamba Elevated Flyover Ramp): Prohibited pedestrian highway classification: flyover"
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
      steps: [],
      segments: []
    }
  ],

  DELHI_HAUZ_KHAS_TO_IIT: [
    {
      id: "route-iit-outer-ring",
      name: "Outer Ring Road Arterial Walkway",
      mode: "FASTEST",
      is_recommended: false,
      description: "Shortest arterial path alongside Sri Aurobindo Marg and Outer Ring Road. Wide open 6-lane highway boundary, sparse trees, hot asphalt.",
      total_length_m: 1580,
      total_duration_min: 16.0,
      detour_percent: 0.0,
      raw_exposure_score: 849.4,
      exposure_label: "HIGH",
      exposure_color: "#EF4444",
      exposure_reduction_pct: 0.0,
      avg_shade_percentage: 20.6,
      waterlogging_risk: "MODERATE_PUDDLES",
      safety: {
        passed_safety_filter: true,
        safety_verdict: "VERIFIED_SAFE",
        safety_score: 0.90,
        violations: []
      },
      contributing_factors: [
        "Unshaded highway sidewalk with direct midday sun",
        "Hot asphalt radiation from heavy traffic flow"
      ],
      confidence: "HIGH",
      path_coordinates: [
        [77.2065, 28.5432],
        [77.2025, 28.5435],
        [77.1975, 28.5440],
        [77.1925, 28.5450]
      ],
      steps: [
        {
          step_num: 1,
          instruction: "Exit Hauz Khas Gate 3 and head west along Outer Ring Road pedestrian footpath",
          distance_m: 420,
          shade_info: "15% tree cover, direct sun",
          water_nearby: "Hauz Khas Metro Gate 3 Water ATM"
        },
        {
          step_num: 2,
          instruction: "Cross Aurobindo Marg signal junction and continue along highway fence",
          distance_m: 540,
          shade_info: "20% low hedge shade, high asphalt heat radiation",
          water_nearby: null
        },
        {
          step_num: 3,
          instruction: "Arrive at IIT Delhi Main Gate security barrier",
          distance_m: 620,
          shade_info: "25% shade near institutional perimeter wall",
          water_nearby: "IIT Delhi Main Gate Hydration Kiosk"
        }
      ],
      segments: []
    },
    {
      id: "route-iit-rose-garden",
      name: "Rose Garden & Gulmohar Green Greenway",
      mode: "COOLEST",
      is_recommended: true,
      description: "Scenic parkland route winding through Hauz Khas Rose Garden trails and mature Gulmohar trees into SDA enclave.",
      total_length_m: 1820,
      total_duration_min: 18.2,
      detour_percent: 13.8,
      raw_exposure_score: 577.1,
      exposure_label: "LOW",
      exposure_color: "#10B981",
      exposure_reduction_pct: 32.1,
      avg_shade_percentage: 79.9,
      waterlogging_risk: "NONE",
      safety: {
        passed_safety_filter: true,
        safety_verdict: "VERIFIED_SAFE",
        safety_score: 0.98,
        violations: []
      },
      contributing_factors: [
        "Dense Gulmohar and Bougainvillea tree canopy cuts radiant heat by 60%",
        "Lush grass lawns absorb thermal insolation instead of radiating heat"
      ],
      confidence: "HIGH",
      path_coordinates: [
        [77.2065, 28.5432],
        [77.2040, 28.5470],
        [77.1985, 28.5480],
        [77.1950, 28.5465],
        [77.1925, 28.5450]
      ],
      steps: [
        {
          step_num: 1,
          instruction: "Turn north into the Hauz Khas Rose Garden shaded pedestrian entrance",
          distance_m: 450,
          shade_info: "80% deep park tree cover, grass lawns absorb thermal radiation",
          water_nearby: "Garden Drinking Fountain"
        },
        {
          step_num: 2,
          instruction: "Follow stone paver walking path under continuous Gulmohar canopy",
          distance_m: 580,
          shade_info: "85% dense overlapping tree canopy",
          water_nearby: null
        },
        {
          step_num: 3,
          instruction: "Exit park gate into quiet SDA green residential lane",
          distance_m: 430,
          shade_info: "75% tree shade, low traffic paver surface",
          water_nearby: "SDA Commercial Market Public Cooler (120m south)"
        },
        {
          step_num: 4,
          instruction: "Cross shaded university lane directly into IIT Delhi Main Gate",
          distance_m: 360,
          shade_info: "70% shade from university campus trees",
          water_nearby: "IIT Delhi Main Gate Hydration Kiosk"
        }
      ],
      segments: []
    },
    {
      id: "route-iit-sda-arcade",
      name: "SDA Market Covered Arcade & Shaded Lane",
      mode: "BALANCED",
      is_recommended: false,
      description: "Passes through the covered pedestrian verandas of SDA Market, offering commercial canopies, water kiosks, and cool stone arcades.",
      total_length_m: 1690,
      total_duration_min: 17.2,
      detour_percent: 7.5,
      raw_exposure_score: 611.4,
      exposure_label: "MODERATE",
      exposure_color: "#F59E0B",
      exposure_reduction_pct: 28.0,
      avg_shade_percentage: 69.9,
      waterlogging_risk: "NONE",
      safety: {
        passed_safety_filter: true,
        safety_verdict: "VERIFIED_SAFE",
        safety_score: 0.95,
        violations: []
      },
      contributing_factors: [
        "Covered commercial market verandas provide 90% rain & sun shielding",
        "Convenient access to SDA market drinking water coolers"
      ],
      confidence: "HIGH",
      path_coordinates: [
        [77.2065, 28.5432],
        [77.2015, 28.5448],
        [77.1970, 28.5455],
        [77.1925, 28.5450]
      ],
      steps: [
        {
          step_num: 1,
          instruction: "Walk along Sri Aurobindo Marg shaded service lane",
          distance_m: 510,
          shade_info: "50% tree shade",
          water_nearby: "Hauz Khas Metro ATM"
        },
        {
          step_num: 2,
          instruction: "Walk through SDA commercial market pedestrian covered arcades",
          distance_m: 530,
          shade_info: "90% covered awnings & building shadows; dry during monsoon",
          water_nearby: "SDA Commercial Market Public Cooler"
        },
        {
          step_num: 3,
          instruction: "Cross quiet connector road directly to IIT Main Gate",
          distance_m: 650,
          shade_info: "60% tree cover",
          water_nearby: "IIT Delhi Main Gate Hydration Kiosk"
        }
      ],
      segments: []
    }
  ],

  DELHI_CHANDNI_CHOWK: [
    {
      id: "route-cc-heritage-mall",
      name: "Chandni Chowk Pedestrian Heritage Mall",
      mode: "FASTEST",
      is_recommended: false,
      description: "Pedestrianized red sandstone corridor with broad walking promenades, water misting poles, and electric rickshaw lanes.",
      total_length_m: 1350,
      total_duration_min: 13.8,
      detour_percent: 0.0,
      raw_exposure_score: 595.3,
      exposure_label: "MODERATE",
      exposure_color: "#F59E0B",
      exposure_reduction_pct: 0.0,
      avg_shade_percentage: 42.0,
      waterlogging_risk: "LOW",
      safety: {
        passed_safety_filter: true,
        safety_verdict: "VERIFIED_SAFE",
        safety_score: 0.95,
        violations: []
      },
      contributing_factors: [
        "Car-free pedestrian boulevard with sandstone paving",
        "Public water misting poles operate along central median"
      ],
      confidence: "HIGH",
      path_coordinates: [
        [77.2285, 28.6575],
        [77.2325, 28.6568],
        [77.2370, 28.6564],
        [77.2410, 28.6560]
      ],
      steps: [
        {
          step_num: 1,
          instruction: "Exit Chandni Chowk Metro Gate 1 onto the central pedestrian mall",
          distance_m: 400,
          shade_info: "40% umbrella and tree shade, red sandstone paving",
          water_nearby: "Chandni Chowk Metro Concourse Hydration Point"
        },
        {
          step_num: 2,
          instruction: "Pass Sis Ganj Sahib Gurudwara and Fountain Chowk",
          distance_m: 450,
          shade_info: "50% shade, heritage building facade shadows",
          water_nearby: "Gurudwara Sis Ganj Sahib Free Chhabil"
        },
        {
          step_num: 3,
          instruction: "Walk past Gauri Shankar Temple towards Red Fort Lahori Gate plaza",
          distance_m: 500,
          shade_info: "35% shade, wide open pedestrian plaza",
          water_nearby: "Red Fort Plaza Tourist Drinking Fountain"
        }
      ],
      segments: []
    },
    {
      id: "route-cc-dariba-haveli",
      name: "Dariba Kalan & Kinari Bazaar Haveli Canyons",
      mode: "COOLEST",
      is_recommended: true,
      description: "Historic 300-year-old narrow urban street canyons (4m wide). Deep haveli building overhangs provide complete all-day shade and rain shielding.",
      total_length_m: 1520,
      total_duration_min: 16.2,
      detour_percent: 17.4,
      raw_exposure_score: 476.3,
      exposure_label: "LOW",
      exposure_color: "#10B981",
      exposure_reduction_pct: 20.0,
      avg_shade_percentage: 88.5,
      waterlogging_risk: "NONE",
      safety: {
        passed_safety_filter: true,
        safety_verdict: "VERIFIED_SAFE",
        safety_score: 0.95,
        violations: []
      },
      contributing_factors: [
        "Narrow 4m street canyons with 3-storey havelis block 90% direct sunlight",
        "Overhead textile awnings shield pedestrians from sun and rain"
      ],
      confidence: "HIGH",
      path_coordinates: [
        [77.2285, 28.6575],
        [77.2310, 28.6550],
        [77.2360, 28.6545],
        [77.2395, 28.6552],
        [77.2410, 28.6560]
      ],
      steps: [
        {
          step_num: 1,
          instruction: "Divert south into Dariba Kalan narrow jewelry street canyon",
          distance_m: 380,
          shade_info: "92% continuous shadow from 3-storey traditional havelis",
          water_nearby: "Kinari Bazaar Heritage Water Kiosk"
        },
        {
          step_num: 2,
          instruction: "Wind through Kinari Bazaar covered awning corridor",
          distance_m: 520,
          shade_info: "95% shade and rain cover under overhead fabric & wooden chhatris",
          water_nearby: null
        },
        {
          step_num: 3,
          instruction: "Turn towards Jama Masjid North Gate shaded alley",
          distance_m: 340,
          shade_info: "85% shade from sandstone walls",
          water_nearby: null
        },
        {
          step_num: 4,
          instruction: "Emerge onto Subhash Park shaded perimeter to Red Fort Lahori Gate",
          distance_m: 280,
          shade_info: "70% shade from mature Banyan trees",
          water_nearby: "Red Fort Plaza Tourist Drinking Fountain"
        }
      ],
      segments: []
    },
    {
      id: "route-cc-netaji-subhash",
      name: "Netaji Subhash Marg Arterial Road",
      mode: "BALANCED",
      is_recommended: false,
      description: "Broad arterial road skirting the eastern boundary. Heavy vehicular traffic, asphalt blacktop, high solar reflection.",
      total_length_m: 1640,
      total_duration_min: 16.8,
      detour_percent: 21.7,
      raw_exposure_score: 849.1,
      exposure_label: "HIGH",
      exposure_color: "#EF4444",
      exposure_reduction_pct: 0.0,
      avg_shade_percentage: 26.5,
      waterlogging_risk: "MODERATE_PUDDLES",
      safety: {
        passed_safety_filter: true,
        safety_verdict: "VERIFIED_SAFE",
        safety_score: 0.88,
        violations: []
      },
      contributing_factors: [
        "Heavy vehicular traffic generates hot exhaust thermal bubble",
        "Wide asphalt carriageway radiates intense stored heat"
      ],
      confidence: "HIGH",
      path_coordinates: [
        [77.2285, 28.6575],
        [77.2330, 28.6590],
        [77.2380, 28.6580],
        [77.2410, 28.6560]
      ],
      steps: [
        {
          step_num: 1,
          instruction: "Walk north towards Old Delhi Railway Station road link",
          distance_m: 450,
          shade_info: "20% shade, open traffic road",
          water_nearby: null
        },
        {
          step_num: 2,
          instruction: "Follow Netaji Subhash Marg sidewalk along Red Fort moat perimeter",
          distance_m: 690,
          shade_info: "30% tree shade from roadside neem trees",
          water_nearby: null
        },
        {
          step_num: 3,
          instruction: "Arrive at Red Fort Main Entrance Gates",
          distance_m: 500,
          shade_info: "25% shade",
          water_nearby: "Red Fort Plaza Tourist Drinking Fountain"
        }
      ],
      segments: []
    }
  ]
};

export const FALLBACK_EVALUATION = {
  status: "SUCCESS",
  corridor_id: "DELHI_CP_TO_MANDI_HOUSE",
  corridor_name: "Rajiv Chowk (Connaught Place) to Mandi House Metro Hub",
  active_season: "SUMMER",
  departure_time: "2026-06-15T13:30:00+05:30",
  solar_altitude_deg: 73.6,
  solar_azimuth_deg: 285.1,
  ambient_temp_c: 43.5,
  relative_humidity: 42.0,
  heat_index_c: 59.8,
  decision_summary: "☀️ Heatwave Advisory (01:30 PM, Sun Altitude: 73.6°): CP Colonnade Arcade & Shaded Lane cuts 31.9% estimated thermal exposure for a modest walk through covered colonnades.",
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
  hydration_pois: FALLBACK_HYDRATION_POIS.filter(p => p.corridor_id === "DELHI_CP_TO_MANDI_HOUSE"),
  routes: FALLBACK_ROUTES_BY_CORRIDOR.DELHI_CP_TO_MANDI_HOUSE
};
