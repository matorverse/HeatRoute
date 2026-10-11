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
  ChevronLeft,
  ChevronRight,
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
import MobileBottomSheet from "./components/MobileBottomSheet";
import { useDeviceLayout } from "./hooks/useDeviceLayout";
import { fetchRouteEvaluation, fetchCorridors } from "./services/api";
import { FALLBACK_CORRIDORS } from "./data/fallbackData";

export default function App() {
  const { isMobile, isDesktop } = useDeviceLayout();
  const [showSplash, setShowSplash] = useState(true);
  const [season, setSeason] = useState("SUMMER"); // "SUMMER" | "MONSOON"
  const [corridors, setCorridors] = useState(FALLBACK_CORRIDORS);
  const [selectedCorridorId, setSelectedCorridorId] = useState("DELHI_CP_TO_MANDI_HOUSE");
  const [activePitstopPoiId, setActivePitstopPoiId] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

    const abortController = new AbortController();

    const timer = setTimeout(() => {
      fetchRouteEvaluation({
        departureTime: isoString,
        ambientTempC: ambientTemp,
        humidityPct: humidity,
        modePreference: "BALANCED",
        maxDetourPercent: 25.0,
        season: season,
        corridorId: isCustomMode ? "CUSTOM_PLANNER" : selectedCorridorId,
        origin: isCustomMode ? customPoints.origin : null,
        destination: isCustomMode ? customPoints.destination : null,
        pitstopPoiId: activePitstopPoiId
      }, abortController.signal).then(data => {
        if (!isMounted || !data) return;
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
      }).catch(err => {
        if (err?.name === "AbortError") return;
        if (isMounted) setIsLoading(false);
      });
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      abortController.abort();
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
      const cleanText = rawText.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{FE00}-\u{FE0F}]/gu, '').trim();
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
          isMobile={isMobile}
          isSidebarCollapsed={isSidebarCollapsed}
        />
      </main>

      {/* 2. Cinematic First-Load Splash Screen */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* 3. Top Floating Glass HUD Navigation Bar */}
      {isMobile ? (
        <header className="hud-topbar mobile-topbar">
          <div className="hud-brand-group">
            <div className="brand-logo-gem">
              <Flame size={18} color="#FF6B2B" />
            </div>
            <div>
              <div className="brand-title-wrap">
                <span className="brand-name">HeatRoute</span>
                <span 
                  className="status-live-dot" 
                  title="Click to view AWS Infrastructure & Telemetry"
                  onClick={() => setIsAwsModalOpen(true)}
                  style={{ cursor: "pointer" }}
                  role="button"
                  tabIndex={0}
                >
                  <span className="pulsing-beacon" />
                  <span>{evaluationData?.is_live_cloud ? "AWS" : "LIVE"}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="mobile-topbar-actions">
            <button
              id="mobile-season-toggle-btn"
              type="button"
              className={`mobile-quick-season-btn ${season === "SUMMER" ? "summer" : "monsoon"}`}
              onClick={() => setSeason(prev => prev === "SUMMER" ? "MONSOON" : "SUMMER")}
              title="Toggle Heatwave / Monsoon Scenario"
            >
              {season === "SUMMER" ? (
                <>
                  <Sun size={13} color="#FBBF24" />
                  <span>{evaluationData?.ambient_temp_c || 43.5}°C</span>
                </>
              ) : (
                <>
                  <CloudRain size={13} color="#38BDF8" />
                  <span>Flood Alert</span>
                </>
              )}
            </button>

            <button
              id="mobile-custom-toggle-btn"
              type="button"
              className={`mobile-quick-pick-btn ${isCustomMode ? "active" : ""}`}
              onClick={handleToggleCustomMode}
              title="Toggle Custom Point-to-Point Route Pinning"
            >
              <MapPin size={13} />
              <span>{isCustomMode ? "Exit" : "Pick"}</span>
            </button>
          </div>
        </header>
      ) : (
        <header className="hud-topbar">
          {/* Brand Gem & Live Telemetry Badge */}
          <div className="hud-brand-group">
            <div className="brand-logo-gem">
              <Flame size={20} color="#FF6B2B" />
            </div>
            <div>
              <div className="brand-title-wrap">
                <span className="brand-name">HeatRoute</span>
                <span 
                  className="status-live-dot" 
                  title="Click to view AWS Infrastructure & Telemetry"
                  onClick={() => setIsAwsModalOpen(true)}
                  style={{ cursor: "pointer" }}
                  role="button"
                  tabIndex={0}
                >
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
          </div>

          {/* Right: Environmental Microclimate Telemetry & Actions */}
          <div className="hud-actions-right">
            <div className="hud-metrics-strip">
              <div className="hud-metric-chip" title="Measured dry-bulb ambient air temperature">
                <span className="chip-label">AIR TEMP</span>
                <span className="chip-val">{evaluationData?.ambient_temp_c || 43.5}°C</span>
              </div>
              <div className="hud-metric-chip" title="Atmospheric relative humidity percentage">
                <span className="chip-label">HUMIDITY</span>
                <span className="chip-val">{evaluationData?.relative_humidity || 42}%</span>
              </div>
              <div 
                className="hud-metric-chip" 
                title={season === "MONSOON" ? "Monsoon flash flooding & waterlogging status" : "Modeled apparent temperature (Rothfusz / Steadman equation accounting for solar geometry)"}
              >
                <span className="chip-label">{season === "MONSOON" ? "FLOOD RISK" : "HEAT INDEX (MODELED)"}</span>
                <span className="chip-val heat" style={{ color: season === "MONSOON" ? "#42D5FF" : "var(--color-heat-amber)" }}>
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
              title="Click to view AWS Infrastructure & Telemetry Details"
            >
              <Cloud size={13} color="#FF9900" />
              <span>AWS Telemetry</span>
            </button>
          </div>
        </header>
      )}

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

      {/* 4. Left Floating Tactical Route Deck (Desktop PC Only) */}
      {isDesktop && (
        isSidebarCollapsed ? (
          <button
            id="sidebar-reopen-btn"
            type="button"
            className="sidebar-reopen-pill"
            onClick={() => setIsSidebarCollapsed(false)}
            title="Open Route Deck"
          >
            <Navigation size={13} color="var(--color-accent-cyan)" />
            <span>Routes ({activeRoutes.length})</span>
            <ChevronRight size={13} />
          </button>
        ) : (
          <aside className="hud-route-deck">
            <div className="deck-scroll-content">
              {/* Corridor Selector Header with Collapse Button */}
              <div className="deck-corridor-box">
                <div className="deck-corridor-select-row">
                  {!isCustomMode ? (
                    <div className="deck-corridor-select-box">
                      <MapPin size={13} color="var(--color-accent-cyan)" />
                      <select
                        id="sidebar-corridor-select"
                        className="deck-corridor-dropdown"
                        value={selectedCorridorId}
                        onChange={handleCorridorChange}
                      >
                        {corridors.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.city})
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={13} className="hud-dropdown-caret" />
                    </div>
                  ) : (
                    <div className="deck-custom-mode-active-pill">
                      <span className="pulsing-beacon-amber" />
                      <span>📍 Custom Map Router Active</span>
                    </div>
                  )}

                  <button
                    type="button"
                    className="deck-collapse-toggle-btn"
                    onClick={() => setIsSidebarCollapsed(true)}
                    title="Collapse routes to view full map"
                    aria-label="Collapse route deck"
                  >
                    <ChevronLeft size={15} />
                  </button>
                </div>

                {/* Compact Origin -> Destination Endpoints */}
                <div className="corridor-endpoints-inline">
                  <span className="endpoint-dot origin" />
                  <span className="endpoint-name-text">{activeCorridor?.origin?.name || "Origin"}</span>
                  <span className="corridor-arrow-glyph">➔</span>
                  <span className="endpoint-dot dest" />
                  <span className="endpoint-name-text">{activeCorridor?.destination?.name || "Destination"}</span>
                </div>
              </div>

              {/* Active Hydration Waypoint Banner */}
              {activePitstopPoi && (
                <div className="pitstop-active-banner">
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Droplets size={13} color="#6EE7B7" />
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

              {/* Health Advisory Banner (IMD Criterion / Official Public Safety) - Streamlined */}
              {season === "SUMMER" && heatIndex >= 54.0 && (
                <div className="health-advisory-banner danger compact">
                  <AlertOctagon size={14} color="#FF555F" style={{ flexShrink: 0, marginTop: "1px" }} />
                  <div className="advisory-inline-wrap">
                    <span className="advisory-source-tag">IMD Red Alert:</span>
                    <span className="advisory-body-text"> Extreme heat hazard (&gt;45°C). Quota: 500ml/30m. Rest in shade.</span>
                  </div>
                </div>
              )}

              {season === "SUMMER" && heatIndex >= 40.0 && heatIndex < 54.0 && (
                <div className="health-advisory-banner warning compact">
                  <AlertTriangle size={14} color="#FFBC59" style={{ flexShrink: 0, marginTop: "1px" }} />
                  <div className="advisory-inline-wrap">
                    <span className="advisory-source-tag">Heat Caution:</span>
                    <span className="advisory-body-text"> High heat stress. Drink 350ml/30m. Favor tree canopies.</span>
                  </div>
                </div>
              )}

              {season === "MONSOON" && (
                <div className="health-advisory-banner monsoon compact">
                  <CloudRain size={14} color="#42D5FF" style={{ flexShrink: 0, marginTop: "1px" }} />
                  <div className="advisory-inline-wrap">
                    <span className="advisory-source-tag">Flood Warning:</span>
                    <span className="advisory-body-text"> Submerged underpass hazard (&gt;1.2m). Colonnades recommended.</span>
                  </div>
                </div>
              )}

              {/* AI Decision Summary - Streamlined */}
              {evaluationData?.decision_summary && (
                <div className="decision-card compact">
                  <Sparkles size={14} className="decision-icon" />
                  <div className="decision-inline-text">
                    <span className="decision-source-tag">AI Rationale: </span>
                    {evaluationData.decision_summary}
                  </div>
                </div>
              )}

              {/* Candidate Routes Header */}
              <div className="deck-section-label">
                <span>Evaluated Paths ({activeRoutes.length})</span>
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
        )
      )}

      {/* 5. Right Floating Hydration HUD (Minimizable Flyout - Desktop PC Only) */}
      {isDesktop && (
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
      )}

      {/* 6. Bottom Floating Diurnal Time-Travel Scrubber Dock (Desktop PC Only) */}
      {isDesktop && (
        <footer className={`hud-bottom-dock ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
          <TimeSlider
            currentHour={currentHour}
            onHourChange={handleHourChange}
            solarAltitude={evaluationData?.solar_altitude_deg}
            solarAzimuth={evaluationData?.solar_azimuth_deg}
          />
        </footer>
      )}

      {/* 7. Mobile 3-Snap Bottom Sheet (Phone Viewport Only) */}
      {isMobile && (
        <MobileBottomSheet
          routes={activeRoutes}
          selectedRouteId={selectedRouteId}
          onSelectRoute={handleSelectRoute}
          activeCorridor={activeCorridor}
          corridors={corridors}
          selectedCorridorId={selectedCorridorId}
          onCorridorChange={handleCorridorChange}
          isCustomMode={isCustomMode}
          onToggleCustomMode={handleToggleCustomMode}
          customPoints={customPoints}
          onResetCustomPoints={handleResetCustomPoints}
          customStatusMessage={customStatusMessage}
          activeSeason={season}
          onSeasonChange={setSeason}
          currentHour={currentHour}
          onHourChange={handleHourChange}
          solarAltitude={evaluationData?.solar_altitude_deg}
          solarAzimuth={evaluationData?.solar_azimuth_deg}
          isPlayingAudio={isPlayingAudio}
          onToggleSpeech={handleToggleSpeech}
          activePitstopPoi={activePitstopPoi}
          activePitstopPoiId={activePitstopPoiId}
          onTogglePitstop={handleTogglePitstop}
          hydrationPois={evaluationData?.hydration_pois || []}
          onOpenAwsModal={() => setIsAwsModalOpen(true)}
          decisionSummary={evaluationData?.decision_summary}
          heatIndex={heatIndex}
          ambientTemp={evaluationData?.ambient_temp_c || 43.5}
          humidity={evaluationData?.relative_humidity || 42}
        />
      )}

      {/* 8. AWS Telemetry & Cloud Metrics Modal */}
      <AwsTelemetryModal
        isOpen={isAwsModalOpen}
        onClose={() => setIsAwsModalOpen(false)}
        telemetry={evaluationData?.aws_telemetry}
        isLiveCloud={evaluationData?.is_live_cloud}
      />
    </div>
  );
}
