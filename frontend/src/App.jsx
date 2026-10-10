import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Flame, 
  Droplets, 
  MapPin, 
  Cloud, 
  Sparkles, 
  Sun, 
  CloudRain, 
  ChevronDown, 
  ChevronUp, 
  Volume2, 
  Square, 
  AlertOctagon, 
  AlertTriangle,
  Navigation,
  X
} from "lucide-react";

import MapView from "./components/MapView";
import RouteCard from "./components/RouteCard";
import TimeSlider from "./components/TimeSlider";
import AwsTelemetryModal from "./components/AwsTelemetryModal";
import SplashScreen from "./components/SplashScreen";
import { fetchRouteEvaluation, fetchCorridors } from "./services/api";
import { FALLBACK_CORRIDORS } from "./data/fallbackData";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [season, setSeason] = useState("SUMMER"); // "SUMMER" | "MONSOON"
  const [corridors, setCorridors] = useState(FALLBACK_CORRIDORS);
  const [selectedCorridorId, setSelectedCorridorId] = useState("DELHI_CP_TO_MANDI_HOUSE");
  const [activePitstopPoiId, setActivePitstopPoiId] = useState(null);

  // Custom Point-to-Point Planner State
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customPoints, setCustomPoints] = useState({ origin: null, destination: null });
  const [customStatusMessage, setCustomStatusMessage] = useState("");

  const [currentHour, setCurrentHour] = useState(13.5); // Default: 1:30 PM (Peak Delhi Heat)
  const [evaluationData, setEvaluationData] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [showHydration, setShowHydration] = useState(true);
  const [isHydrationOpen, setIsHydrationOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAwsModalOpen, setIsAwsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available testbed corridors on mount
  useEffect(() => {
    fetchCorridors().then(list => {
      if (list && list.length > 0) {
        setCorridors(list);
      }
    });
  }, []);

  const activeCorridor = useMemo(() => {
    if (isCustomMode && customPoints.origin && customPoints.destination) {
      return {
        id: "CUSTOM_PLANNER",
        name: `Custom Route (${customPoints.origin[1].toFixed(3)}, ${customPoints.origin[0].toFixed(3)} → ${customPoints.destination[1].toFixed(3)}, ${customPoints.destination[0].toFixed(3)})`,
        city: "Live Map Pick",
        origin: { name: `Start (${customPoints.origin[1].toFixed(4)}, ${customPoints.origin[0].toFixed(4)})`, coordinates: customPoints.origin },
        destination: { name: `Destination (${customPoints.destination[1].toFixed(4)}, ${customPoints.destination[0].toFixed(4)})`, coordinates: customPoints.destination }
      };
    }
    return corridors.find(c => c.id === selectedCorridorId) || corridors[0];
  }, [corridors, selectedCorridorId, isCustomMode, customPoints]);

  // Recalculate routes on parameter change with 100ms debounce
  useEffect(() => {
    let isMounted = true;

    // If in custom mode but points are not both placed, don't trigger
    if (isCustomMode && (!customPoints.origin || !customPoints.destination)) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const hours = Math.floor(currentHour);
    const mins = Math.round((currentHour - hours) * 60);
    const hourStr = hours < 10 ? `0${hours}` : `${hours}`;
    const minStr = mins < 10 ? `0${mins}` : `${mins}`;
    const dateStr = season === "MONSOON" ? "2026-07-28" : "2026-06-15";
    const isoString = `${dateStr}T${hourStr}:${minStr}:00+05:30`;

    const ambientTemp = season === "MONSOON" ? 32.5 : (currentHour >= 16 ? 40.0 : 43.5);
    const humidity = season === "MONSOON" ? 85.0 : (currentHour >= 16 ? 45.0 : 42.0);

    const timer = setTimeout(() => {
      fetchRouteEvaluation({
        departureTime: isoString,
        ambientTempC: ambientTemp,
        humidityPct: humidity,
        modePreference: "BALANCED",
        season: season,
        corridorId: isCustomMode ? "CUSTOM_PLANNER" : selectedCorridorId,
        origin: isCustomMode ? customPoints.origin : null,
        destination: isCustomMode ? customPoints.destination : null,
        pitstopPoiId: activePitstopPoiId
      }).then(data => {
        if (isMounted) {
          setEvaluationData(data);
          setIsLoading(false);
          if (isCustomMode && customPoints.origin && customPoints.destination) {
            setCustomStatusMessage("✓ Custom Routes Active · Click map to repick or Reset");
          }
          // Preserve currently selected route if valid, otherwise fallback to recommended
          setSelectedRouteId(prev => {
            if (prev && data.routes?.some(r => r.id === prev && r.mode !== "REJECTED_UNSAFE")) {
              return prev;
            }
            const rec = data.routes?.find(r => r.is_recommended) || data.routes?.[0];
            return rec ? rec.id : prev;
          });
        }
      });
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [currentHour, season, selectedCorridorId, activePitstopPoiId, isCustomMode, customPoints]);

  const handleSelectRoute = useCallback((id) => {
    setSelectedRouteId(id);
  }, []);

  const handleHourChange = useCallback((val) => {
    setCurrentHour(val);
  }, []);

  const handleTogglePitstop = useCallback((poiId) => {
    setActivePitstopPoiId(prev => (prev === poiId ? null : poiId));
  }, []);

  const handleCorridorChange = (e) => {
    setSelectedCorridorId(e.target.value);
    setActivePitstopPoiId(null);
  };

  // Toggle Custom Mode
  const handleToggleCustomMode = useCallback(() => {
    setIsCustomMode(prev => {
      const next = !prev;
      if (next) {
        setCustomPoints({ origin: null, destination: null });
        setCustomStatusMessage("👉 Click anywhere on map to drop Start Pin (A)");
      } else {
        setCustomPoints({ origin: null, destination: null });
        setCustomStatusMessage("");
        setSelectedCorridorId("DELHI_CP_TO_MANDI_HOUSE");
      }
      return next;
    });
  }, []);

  // Map Click handler for Custom Points
  const handleMapClickPoint = useCallback((coords) => {
    if (!customPoints.origin) {
      setCustomPoints({ origin: coords, destination: null });
      setCustomStatusMessage("👉 Start (A) placed! Now click on map to set Destination (B)");
    } else if (!customPoints.destination) {
      setCustomPoints(prev => ({ ...prev, destination: coords }));
      setCustomStatusMessage("✓ Calculating microclimate routes...");
    } else {
      // Repicking origin
      setCustomPoints({ origin: coords, destination: null });
      setCustomStatusMessage("👉 New Start (A) placed! Click to set Destination (B)");
    }
  }, [customPoints]);

  // Reset custom points
  const handleResetCustomPoints = useCallback(() => {
    setCustomPoints({ origin: null, destination: null });
    setCustomStatusMessage("👉 Click anywhere on map to drop Start Pin (A)");
  }, []);

  // Hands-free speech synthesis
  const handleToggleSpeech = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const rawText = evaluationData?.decision_summary || "HeatRoute pedestrian guidance active.";
      const cleanText = rawText.replace(/[\u{1F600}-\u{1F6FF}|[\u{2600}-\u{26FF}]/gu, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  }, [isPlayingAudio, evaluationData]);

  const activeRoutes = evaluationData?.routes || [];
  const selectedRoute = activeRoutes.find(r => r.id === selectedRouteId) || activeRoutes[0];
  const activePitstopPoi = activePitstopPoiId 
    ? evaluationData?.hydration_pois?.find(p => p.id === activePitstopPoiId) 
    : null;

  const heatIndex = evaluationData?.heat_index_c || 59.8;

  return (
    <div className="spatial-app-container">
      {/* 1. Full-Bleed Edge-to-Edge Amazon Location Vector Map */}
      <main className="map-full-viewport">
        <MapView
          routes={activeRoutes}
          selectedRouteId={selectedRouteId}
          onSelectRoute={handleSelectRoute}
          hydrationPois={evaluationData?.hydration_pois || []}
          showHydration={showHydration}
          solarAltitude={evaluationData?.solar_altitude_deg || 70}
          solarAzimuth={evaluationData?.solar_azimuth_deg || 280}
          activeCorridor={activeCorridor}
          activePitstopPoiId={activePitstopPoiId}
          onTogglePitstop={handleTogglePitstop}
          isCustomMode={isCustomMode}
          customPoints={customPoints}
          onMapClickPoint={handleMapClickPoint}
        />
      </main>

      {/* 2. Cinematic First-Load Splash Screen */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* 3. Top Floating Glass HUD Navigation Bar */}
      <header className="hud-topbar">
        {/* Brand Gem & Live Telemetry Badge */}
        <div className="hud-brand-group">
          <div className="brand-logo-gem">
            <Flame size={20} color="#FF6B2B" />
          </div>
          <div>
            <div className="brand-title-wrap">
              <span className="brand-name">HeatRoute</span>
              <span className="status-live-dot" title="Live Amazon Location Service Engine">
                <span className="pulsing-beacon" />
                <span>{evaluationData?.is_live_cloud ? "AWS LIVE" : "DEMO READY"}</span>
              </span>
            </div>
            <span className="track-subtext">Track 02 · Heat & Water</span>
          </div>
        </div>

        {/* Center: Dual-Hazard Scenario Switcher & Corridor Dropdown */}
        <div className="hud-controls-center">
          <div className="hud-season-segmented">
            <button
              id="season-summer-btn"
              type="button"
              className={`hud-season-btn ${season === "SUMMER" ? "active-summer" : ""}`}
              onClick={() => setSeason("SUMMER")}
            >
              <Sun size={14} color={season === "SUMMER" ? "#FBBF24" : "currentColor"} />
              <span>☀️ Peak Heatwave (43.5°C)</span>
            </button>

            <button
              id="season-monsoon-btn"
              type="button"
              className={`hud-season-btn ${season === "MONSOON" ? "active-monsoon" : ""}`}
              onClick={() => setSeason("MONSOON")}
            >
              <CloudRain size={14} color={season === "MONSOON" ? "#38BDF8" : "currentColor"} />
              <span>⛈️ Monsoon Flood</span>
            </button>
          </div>

          {/* Interactive Point-to-Point Custom Route Planner Toggle */}
          <button
            id="toggle-custom-planner-btn"
            type="button"
            className={`hud-custom-planner-btn ${isCustomMode ? "active" : ""}`}
            onClick={handleToggleCustomMode}
            title={isCustomMode ? "Exit Custom Planner" : "Click any two points on the map to calculate routes in real-time"}
          >
            <MapPin size={13} color={isCustomMode ? "#FF6B2B" : "currentColor"} />
            <span>{isCustomMode ? "Exit Custom" : "📍 Pick on Map"}</span>
          </button>

          {!isCustomMode && (
            <div className="hud-corridor-select-box">
              <MapPin size={13} color="var(--color-heat-primary)" />
              <select
                id="corridor-select"
                className="hud-corridor-dropdown"
                value={selectedCorridorId}
                onChange={handleCorridorChange}
              >
                {corridors.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city})
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="hud-dropdown-caret" />
            </div>
          )}
        </div>

        {/* Right: Environmental Microclimate Telemetry & Actions */}
        <div className="hud-actions-right">
          <div className="hud-metrics-strip">
            <div className="hud-metric-chip">
              <span className="chip-label">TEMP</span>
              <span className="chip-val">{evaluationData?.ambient_temp_c || 43.5}°C</span>
            </div>
            <div className="hud-metric-chip">
              <span className="chip-label">HUMIDITY</span>
              <span className="chip-val">{evaluationData?.relative_humidity || 42}%</span>
            </div>
            <div className="hud-metric-chip">
              <span className="chip-label">{season === "MONSOON" ? "FLOOD RISK" : "HEAT INDEX"}</span>
              <span className="chip-val heat" style={{ color: season === "MONSOON" ? "#38BDF8" : "var(--color-solar)" }}>
                {season === "MONSOON" ? "ALERT" : `${heatIndex}°C`}
              </span>
            </div>
          </div>

          <button
            id="audio-advisory-btn"
            type="button"
            className={`hud-audio-btn ${isPlayingAudio ? "playing" : ""}`}
            onClick={handleToggleSpeech}
            title="Hands-free audio safety advisory for street pedestrians"
          >
            {isPlayingAudio ? (
              <>
                <Square size={12} />
                <span>Stop</span>
                <span className="audio-bars-anim">
                  <span className="bar bar-1" />
                  <span className="bar bar-2" />
                  <span className="bar bar-3" />
                </span>
              </>
            ) : (
              <>
                <Volume2 size={13} />
                <span>Listen</span>
              </>
            )}
          </button>

          <button
            id="open-aws-telemetry"
            type="button"
            className="hud-aws-btn"
            onClick={() => setIsAwsModalOpen(true)}
          >
            <Cloud size={13} />
            <span>AWS Telemetry</span>
          </button>
        </div>
      </header>

      {/* Floating Interactive Route Planner Guidance Toast */}
      {isCustomMode && (
        <div className="hud-custom-instruction-pill">
          <div className="custom-pill-left">
            <span className="pulsing-beacon-amber" />
            <span className="custom-pill-text">
              {customStatusMessage || (!customPoints.origin ? "Click anywhere on map to drop Start Pin (A)" : "Click map to drop Destination Pin (B)")}
            </span>
          </div>
          {customPoints.origin && (
            <button
              type="button"
              className="custom-pill-reset-btn"
              onClick={handleResetCustomPoints}
              title="Clear pins and pick new coordinates"
            >
              Reset Pins
            </button>
          )}
        </div>
      )}

      {/* 4. Left Floating Tactical Route Deck */}
      <aside className="hud-route-deck">
        <div className="deck-scroll-content">
          {/* Corridor Endpoints Indicator */}
          <div className="corridor-endpoints-banner">
            <div className="endpoint-tag">
              <span className="endpoint-dot origin" />
              <span>{activeCorridor?.origin?.name || "Origin"}</span>
            </div>
            <span className="corridor-arrow">➔</span>
            <div className="endpoint-tag">
              <span className="endpoint-dot dest" />
              <span>{activeCorridor?.destination?.name || "Destination"}</span>
            </div>
          </div>

          {/* Active Hydration Waypoint Banner */}
          {activePitstopPoi && (
            <div className="pitstop-active-banner">
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Droplets size={14} color="#6EE7B7" />
                <span>Waypoint: <strong>{activePitstopPoi.name}</strong> (+1.5m)</span>
              </div>
              <button 
                className="pitstop-clear-btn"
                onClick={() => setActivePitstopPoiId(null)}
                title="Remove pitstop waypoint"
              >
                Clear
              </button>
            </div>
          )}

          {/* Health Advisory Banner (IMD / Medical Standard) */}
          {season === "SUMMER" && heatIndex >= 54.0 && (
            <div className="health-advisory-banner danger">
              <AlertOctagon size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ color: "#FCA5A5" }}>IMD Red Alert (Extreme Heat Hazard):</strong> Heat stroke risk imminent. Hydration quota: 500ml every 30m. Rest in covered shade every 1 km.
              </div>
            </div>
          )}

          {season === "SUMMER" && heatIndex >= 40.0 && heatIndex < 54.0 && (
            <div className="health-advisory-banner warning">
              <AlertTriangle size={16} color="#F59E0B" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ color: "#FDE68A" }}>High Heat Caution:</strong> Heat cramps likely. Drink 350ml water every 30m. Favor heritage tree canopies.
              </div>
            </div>
          )}

          {season === "MONSOON" && (
            <div className="health-advisory-banner monsoon">
              <CloudRain size={16} color="#38BDF8" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ color: "#BAE6FD" }}>Monsoon Inundation Warning:</strong> Flash flooding detected in railway subways and sunken underpasses. Elevated colonnade paths advised.
              </div>
            </div>
          )}

          {/* Explainable Decision Summary */}
          {evaluationData?.decision_summary && (
            <div className="decision-card">
              <Sparkles size={18} className="decision-icon" />
              <div className="decision-text">
                {evaluationData.decision_summary}
              </div>
            </div>
          )}

          {/* Candidate Routes List */}
          <div className="deck-section-label">
            <span>Evaluated Candidate Paths ({activeRoutes.length})</span>
          </div>

          <div className="routes-deck-list">
            {activeRoutes.map(route => (
              <RouteCard
                key={route.id}
                route={route}
                isSelected={route.id === selectedRouteId}
                onSelect={handleSelectRoute}
                activeSeason={season}
                corridorName={activeCorridor?.name}
                onAddPitstop={handleTogglePitstop}
              />
            ))}
          </div>
        </div>
      </aside>

      {/* 5. Right Floating Hydration HUD (Minimizable Flyout) */}
      <div className="hud-hydration-dock">
        <button
          type="button"
          className="hud-hydration-header-toggle"
          onClick={() => setIsHydrationOpen(!isHydrationOpen)}
          title="Toggle verified drinking water & recovery points"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <Droplets size={14} color="#38BDF8" />
            <span>Water & Rest Stops ({evaluationData?.hydration_pois?.length || 0})</span>
          </div>
          {isHydrationOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {isHydrationOpen && evaluationData?.hydration_pois && (
          <div className="hud-hydration-list">
            {evaluationData.hydration_pois.map(poi => {
              const isAdded = activePitstopPoiId === poi.id;
              return (
                <div key={poi.id} className="hydration-station-card">
                  <div className="station-card-top">
                    <span className="station-name">{poi.name}</span>
                    <span className="station-type-tag">{poi.type.replace(/_/g, ' ')}</span>
                  </div>

                  <div className="station-features-row">
                    {poi.features?.map((f, i) => (
                      <span key={i} className="station-feature-badge">{f}</span>
                    ))}
                  </div>

                  <div className="station-card-bottom">
                    <span className="station-accessibility">● {poi.accessibility || "Open to public"}</span>
                    <button
                      type="button"
                      className={`station-waypoint-btn ${isAdded ? "active" : ""}`}
                      onClick={() => handleTogglePitstop(poi.id)}
                    >
                      {isAdded ? "✓ Waypoint Added" : "+ Add Waypoint"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Bottom Floating Diurnal Time-Travel Scrubber Dock */}
      <footer className="hud-bottom-dock">
        <TimeSlider
          currentHour={currentHour}
          onHourChange={handleHourChange}
          solarAltitude={evaluationData?.solar_altitude_deg}
          solarAzimuth={evaluationData?.solar_azimuth_deg}
        />
      </footer>

      {/* 7. AWS Telemetry & Cloud Metrics Modal */}
      <AwsTelemetryModal
        isOpen={isAwsModalOpen}
        onClose={() => setIsAwsModalOpen(false)}
        telemetry={evaluationData?.aws_telemetry}
        isLiveCloud={evaluationData?.is_live_cloud}
      />
    </div>
  );
}
