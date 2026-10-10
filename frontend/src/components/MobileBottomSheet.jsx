import React, { useState, useRef, useEffect } from "react";
import { 
  ChevronUp, 
  ChevronDown, 
  Volume2, 
  Square, 
  Droplets, 
  Sun, 
  CloudRain, 
  Clock, 
  Trees, 
  Cloud, 
  MapPin, 
  Compass, 
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  Sliders
} from "lucide-react";
import RouteCard from "./RouteCard";
import TimeSlider from "./TimeSlider";

export function MobileBottomSheet({
  routes = [],
  selectedRouteId,
  onSelectRoute,
  activeCorridor,
  corridors = [],
  selectedCorridorId,
  onCorridorChange,
  isCustomMode = false,
  onToggleCustomMode,
  customPoints = { origin: null, destination: null },
  onResetCustomPoints,
  customStatusMessage = "",
  activeSeason = "SUMMER",
  onSeasonChange,
  currentHour = 13.5,
  onHourChange,
  solarAltitude = 70,
  solarAzimuth = 280,
  isPlayingAudio = false,
  onToggleSpeech,
  activePitstopPoi = null,
  activePitstopPoiId = null,
  onTogglePitstop,
  hydrationPois = [],
  onOpenAwsModal,
  decisionSummary = "",
  heatIndex = 59.8,
  ambientTemp = 43.5,
  humidity = 42
}) {
  // Snap points: "peek" (~105px), "half" (~50vh), "full" (~88vh)
  const [sheetState, setSheetState] = useState("peek");
  const [activeTab, setActiveTab] = useState("routes"); // "routes" | "stops" | "solar"
  const touchStartY = useRef(0);
  const touchDeltaY = useRef(0);
  const sheetRef = useRef(null);

  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchDeltaY.current = 0;
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    touchDeltaY.current = currentY - touchStartY.current;
  };

  const handleTouchEnd = () => {
    const delta = touchDeltaY.current;
    const threshold = 45; // minimum swipe distance in pixels

    if (delta < -threshold) {
      // Swiped UP
      if (sheetState === "peek") setSheetState("half");
      else if (sheetState === "half") setSheetState("full");
    } else if (delta > threshold) {
      // Swiped DOWN
      if (sheetState === "full") setSheetState("half");
      else if (sheetState === "half") setSheetState("peek");
    }
  };

  const cycleSheetState = () => {
    if (sheetState === "peek") setSheetState("half");
    else if (sheetState === "half") setSheetState("full");
    else setSheetState("peek");
  };

  const modeBadgeColor = {
    COOLEST: "#10B981",
    BALANCED: "#F59E0B",
    FASTEST: "#EF4444",
    SAFEST_DRY: "#38BDF8",
    REJECTED_UNSAFE: "#9CA3AF"
  }[selectedRoute?.mode] || "#10B981";

  return (
    <div 
      ref={sheetRef}
      className={`mobile-bottom-sheet sheet-${sheetState}`}
    >
      {/* Draggable Top Grip Handle */}
      <div 
        className="mobile-sheet-handle-zone"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={cycleSheetState}
      >
        <div className="mobile-sheet-handle-bar" />
      </div>

      {/* 1. PEEK SUMMARY BAR (Always visible at bottom when sheetState === 'peek') */}
      <div 
        className="mobile-sheet-peek-bar"
        onClick={cycleSheetState}
      >
        <div className="peek-left-info">
          <div className="peek-badge-row">
            <span 
              className="peek-mode-pill"
              style={{ backgroundColor: `${modeBadgeColor}25`, color: modeBadgeColor, borderColor: `${modeBadgeColor}60` }}
            >
              {selectedRoute?.mode ? selectedRoute.mode.replace("_", " ") : "RECOMMENDED"}
            </span>
            <span className="peek-eta-val">
              <Clock size={11} />
              {selectedRoute?.total_duration_min || 20} min
            </span>
            <span className="peek-shade-val">
              <Trees size={11} />
              {selectedRoute?.avg_shade_percentage || 65}% Shade
            </span>
          </div>
          <div className="peek-route-name">
            {selectedRoute?.name || "Evaluating Microclimate Routes..."}
          </div>
        </div>

        <div className="peek-right-actions" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={`peek-audio-btn ${isPlayingAudio ? "playing" : ""}`}
            onClick={onToggleSpeech}
            title="Hands-free audio guide"
          >
            {isPlayingAudio ? (
              <>
                <Square size={13} />
                <span className="audio-bars-anim">
                  <span className="bar bar-1" />
                  <span className="bar bar-2" />
                  <span className="bar bar-3" />
                </span>
              </>
            ) : (
              <Volume2 size={16} />
            )}
          </button>
          
          <button
            type="button"
            className="peek-expand-chevron"
            onClick={cycleSheetState}
            title={sheetState === "peek" ? "Expand routes" : "Collapse"}
          >
            {sheetState === "full" ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </div>

      {/* 2. EXPANDED CONTENT AREA (Visible in 'half' and 'full' states) */}
      <div className="mobile-sheet-scrollable-body">
        {/* Corridor Endpoints Header & Mode Switch */}
        <div className="mobile-corridor-header">
          <div className="mobile-endpoints-tag">
            <span className="mobile-endpoint-dot origin" />
            <span className="mobile-endpoint-name">{activeCorridor?.origin?.name || "Start"}</span>
            <span className="mobile-arrow">➔</span>
            <span className="mobile-endpoint-dot dest" />
            <span className="mobile-endpoint-name">{activeCorridor?.destination?.name || "End"}</span>
          </div>

          <button
            type="button"
            className="mobile-collapse-btn"
            onClick={() => setSheetState(sheetState === "full" ? "half" : "peek")}
          >
            <ChevronDown size={14} />
            <span>{sheetState === "full" ? "Half" : "Close"}</span>
          </button>
        </div>

        {/* Corridor Selector / Custom Switcher Row */}
        <div className="mobile-corridor-controls-row">
          {!isCustomMode ? (
            <div className="mobile-select-box">
              <MapPin size={13} color="var(--color-heat-primary)" />
              <select
                id="mobile-corridor-select"
                className="mobile-corridor-dropdown"
                value={selectedCorridorId}
                onChange={onCorridorChange}
              >
                {corridors.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city})
                  </option>
                ))}
              </select>
              <ChevronDown size={13} className="mobile-dropdown-caret" />
            </div>
          ) : (
            <div className="mobile-custom-active-tag">
              <span className="pulsing-beacon-amber" />
              <span>{customStatusMessage || "Custom Points Mode Active"}</span>
              {customPoints?.origin && (
                <button
                  type="button"
                  className="mobile-reset-btn"
                  onClick={onResetCustomPoints}
                >
                  Reset
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            className={`mobile-pick-btn ${isCustomMode ? "active" : ""}`}
            onClick={onToggleCustomMode}
          >
            <MapPin size={12} />
            <span>{isCustomMode ? "Presets" : "Pick on Map"}</span>
          </button>
        </div>

        {/* Hazard Scenario Switcher Buttons */}
        <div className="mobile-hazard-segmented">
          <button
            type="button"
            className={`mobile-hazard-btn ${activeSeason === "SUMMER" ? "active-summer" : ""}`}
            onClick={() => onSeasonChange("SUMMER")}
          >
            <Sun size={13} color={activeSeason === "SUMMER" ? "#FBBF24" : "currentColor"} />
            <span>☀️ Heatwave ({ambientTemp}°C)</span>
          </button>
          <button
            type="button"
            className={`mobile-hazard-btn ${activeSeason === "MONSOON" ? "active-monsoon" : ""}`}
            onClick={() => onSeasonChange("MONSOON")}
          >
            <CloudRain size={13} color={activeSeason === "MONSOON" ? "#38BDF8" : "currentColor"} />
            <span>⛈️ Monsoon Flood</span>
          </button>
        </div>

        {/* Health Advisory / IMD Warning Banner */}
        {activeSeason === "SUMMER" && heatIndex >= 54.0 && (
          <div className="health-advisory-banner danger mobile-advisory">
            <AlertOctagon size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong style={{ color: "#FCA5A5" }}>IMD Red Alert ({heatIndex}°C):</strong> Severe heat stroke risk. Drink 500ml water every 30m. Prefer shaded colonial arcades.
            </div>
          </div>
        )}

        {activeSeason === "SUMMER" && heatIndex >= 40.0 && heatIndex < 54.0 && (
          <div className="health-advisory-banner warning mobile-advisory">
            <AlertTriangle size={16} color="#F59E0B" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong style={{ color: "#FDE68A" }}>Heat Caution:</strong> Heat cramps probable. Favor heritage tree canopies.
            </div>
          </div>
        )}

        {activeSeason === "MONSOON" && (
          <div className="health-advisory-banner monsoon mobile-advisory">
            <CloudRain size={16} color="#38BDF8" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong style={{ color: "#BAE6FD" }}>Monsoon Inundation Warning:</strong> Flash flooding detected in railway subways. Colonnades and elevated footpaths recommended.
            </div>
          </div>
        )}

        {/* Decision Summary Card */}
        {decisionSummary && (
          <div className="decision-card mobile-decision">
            <Sparkles size={16} className="decision-icon" />
            <div className="decision-text">{decisionSummary}</div>
          </div>
        )}

        {/* Active Pitstop Banner if selected */}
        {activePitstopPoi && (
          <div className="mobile-pitstop-banner">
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Droplets size={14} color="#6EE7B7" />
              <span>Waypoint: <strong>{activePitstopPoi.name}</strong> (+1.5m)</span>
            </div>
            <button 
              className="mobile-pitstop-clear-btn" 
              onClick={() => onTogglePitstop(activePitstopPoi.id)}
            >
              Clear
            </button>
          </div>
        )}

        {/* Mobile Navigation Tabs */}
        <div className="mobile-sheet-tab-row">
          <button
            type="button"
            className={`mobile-tab-btn ${activeTab === "routes" ? "active" : ""}`}
            onClick={() => setActiveTab("routes")}
          >
            <span>Candidate Routes ({routes.length})</span>
          </button>
          <button
            type="button"
            className={`mobile-tab-btn ${activeTab === "stops" ? "active" : ""}`}
            onClick={() => setActiveTab("stops")}
          >
            <span>Water & Rest ({hydrationPois.length})</span>
          </button>
          <button
            type="button"
            className={`mobile-tab-btn ${activeTab === "solar" ? "active" : ""}`}
            onClick={() => setActiveTab("solar")}
          >
            <span>Solar Scrubber</span>
          </button>
        </div>

        {/* TAB 1: ROUTE CARDS */}
        {activeTab === "routes" && (
          <div className="mobile-route-cards-list">
            {routes.map(route => (
              <RouteCard
                key={route.id}
                route={route}
                isSelected={route.id === selectedRouteId}
                onSelect={(id) => {
                  onSelectRoute(id);
                  // Snap to half or peek so user can observe the updated map line!
                  if (sheetState === "full") setSheetState("half");
                }}
                activeSeason={activeSeason}
                corridorName={activeCorridor?.name}
                onAddPitstop={onTogglePitstop}
              />
            ))}
          </div>
        )}

        {/* TAB 2: WATER & REST POIS */}
        {activeTab === "stops" && (
          <div className="mobile-hydration-list">
            {hydrationPois.map(poi => {
              const isAdded = activePitstopPoiId === poi.id;
              return (
                <div key={poi.id} className="hydration-station-card">
                  <div className="station-card-top">
                    <span className="station-name">{poi.name}</span>
                    <span className="station-type-tag">{poi.type.replace(/_/g, " ")}</span>
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
                      onClick={() => onTogglePitstop(poi.id)}
                    >
                      {isAdded ? "✓ Waypoint Added" : "+ Add Waypoint"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: SOLAR TIME-TRAVEL SCRUBBER */}
        {activeTab === "solar" && (
          <div className="mobile-solar-tab-wrapper">
            <TimeSlider
              currentHour={currentHour}
              onHourChange={onHourChange}
              solarAltitude={solarAltitude}
              solarAzimuth={solarAzimuth}
            />
          </div>
        )}

        {/* Mobile Sheet Footer Actions */}
        <div className="mobile-sheet-footer">
          <button
            type="button"
            className="mobile-footer-aws-btn"
            onClick={onOpenAwsModal}
          >
            <Cloud size={14} />
            <span>AWS Telemetry & CloudWatch Metrics</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(MobileBottomSheet);
