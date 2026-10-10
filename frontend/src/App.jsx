import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Flame, 
  Droplets, 
  MapPin, 
  Info, 
  Cloud, 
  Sparkles, 
  Thermometer, 
  ShieldCheck,
  Sun,
  CloudRain,
  ChevronDown,
  ChevronUp,
  X,
  Volume2,
  Square,
  AlertOctagon,
  AlertTriangle,
  Navigation
} from "lucide-react";

import MapView from "./components/MapView";
import RouteCard from "./components/RouteCard";
import TimeSlider from "./components/TimeSlider";
import AwsTelemetryModal from "./components/AwsTelemetryModal";
import { fetchRouteEvaluation, fetchCorridors } from "./services/api";
import { FALLBACK_CORRIDORS } from "./data/fallbackData";

export default function App() {
  const [season, setSeason] = useState("SUMMER"); // "SUMMER" | "MONSOON"
  const [corridors, setCorridors] = useState(FALLBACK_CORRIDORS);
  const [selectedCorridorId, setSelectedCorridorId] = useState("DELHI_CP_TO_MANDI_HOUSE");
  const [activePitstopPoiId, setActivePitstopPoiId] = useState(null);

  const [currentHour, setCurrentHour] = useState(13.5); // Default: 1:30 PM (Peak Delhi Heat)
  const [evaluationData, setEvaluationData] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [showHydration, setShowHydration] = useState(true);
  const [showStationsList, setShowStationsList] = useState(false);
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
    return corridors.find(c => c.id === selectedCorridorId) || corridors[0];
  }, [corridors, selectedCorridorId]);

  // Recalculate routes on parameter change with 100ms debounce
  useEffect(() => {
    let isMounted = true;
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
        corridorId: selectedCorridorId,
        pitstopPoiId: activePitstopPoiId
      }).then(data => {
        if (isMounted) {
          setEvaluationData(data);
          setIsLoading(false);
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
  }, [currentHour, season, selectedCorridorId, activePitstopPoiId]);

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
    <div className="app-container">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <header className="sidebar-header">
          <div className="brand-badge-container">
            <h1 className="brand-title">
              <Flame size={26} color="#F97316" />
              <span>HeatRoute</span>
            </h1>
            <span className="track-badge">Track 02 · Heat & Water</span>
          </div>
          <p className="tagline">
            Climate-resilient pedestrian routing layer for extreme summer heatwaves and monsoon flash flooding.
          </p>
        </header>

        {/* Hazard & Corridor Controls */}
        <section className="control-section">
          {/* Dual-Hazard Season Switcher */}
          <div className="section-label">
            <span>Climate Hazard Scenario</span>
          </div>
          <div className="season-toggle-group">
            <button
              id="season-summer-btn"
              className={`season-btn summer ${season === "SUMMER" ? "active" : ""}`}
              onClick={() => setSeason("SUMMER")}
            >
              <Sun size={15} color={season === "SUMMER" ? "#FBBF24" : "currentColor"} />
              <span>☀️ Peak Heatwave (43.5°C)</span>
            </button>

            <button
              id="season-monsoon-btn"
              className={`season-btn monsoon ${season === "MONSOON" ? "active" : ""}`}
              onClick={() => setSeason("MONSOON")}
            >
              <CloudRain size={15} color={season === "MONSOON" ? "#38BDF8" : "currentColor"} />
              <span>⛈️ Monsoon Flood</span>
            </button>
          </div>

          {/* Microclimate Corridor Switcher */}
          <div className="section-label" style={{ marginTop: "6px" }}>
            <MapPin size={13} />
            <span>Active Corridor Testbed ({corridors.length} Typologies)</span>
          </div>

          <div className="corridor-select-wrapper">
            <select
              id="corridor-select"
              className="corridor-select-input"
              value={selectedCorridorId}
              onChange={handleCorridorChange}
            >
              {corridors.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.city})
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="corridor-select-arrow" />
          </div>

          <div className="corridor-banner">
            <div className="corridor-endpoints">
              <span style={{ color: "#10B981" }}>● Origin: {activeCorridor?.origin?.name || "Origin"}</span>
              <span>➔</span>
              <span style={{ color: "#EF4444" }}>● Dest: {activeCorridor?.destination?.name || "Destination"}</span>
            </div>
          </div>

          {/* Active Hydration Pitstop Waypoint Banner if Set */}
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

          {/* Atmospheric Environmental Metrics */}
          <div className="metrics-strip">
            <div className="metric-pill">
              <span className="metric-pill-label">Ambient Temp</span>
              <span className="metric-pill-value">
                {evaluationData?.ambient_temp_c || 43.5}°C
              </span>
            </div>
            <div className="metric-pill">
              <span className="metric-pill-label">Humidity</span>
              <span className="metric-pill-value">
                {evaluationData?.relative_humidity || 42}%
              </span>
            </div>
            <div className="metric-pill">
              <span className="metric-pill-label">
                {season === "MONSOON" ? "Inundation Index" : "Heat Index"}
              </span>
              <span 
                className="metric-pill-value" 
                style={{ color: season === "MONSOON" ? "#38BDF8" : "var(--color-accent)" }}
              >
                {season === "MONSOON" ? "ALERT" : `${heatIndex}°C`}
              </span>
            </div>
          </div>

          {/* Real-time Health Advisory Banner (IMD / Medical Standard) */}
          {season === "SUMMER" && heatIndex >= 54.0 && (
            <div className="health-advisory-banner danger">
              <AlertOctagon size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ color: "#FCA5A5" }}>IMD Red Alert (Extreme Heat Hazard):</strong> Heat stroke risk imminent with prolonged exposure. Recommended hydration: 500ml every 30m. Rest in covered shade every 1 km.
              </div>
            </div>
          )}

          {season === "SUMMER" && heatIndex >= 40.0 && heatIndex < 54.0 && (
            <div className="health-advisory-banner warning">
              <AlertTriangle size={16} color="#F59E0B" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ color: "#FDE68A" }}>High Heat Caution:</strong> Heat cramps likely. Maintain fluid intake (350ml every 30m). Favor tree canopy routes.
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

          {/* Interactive Time-Travel Slider */}
          <TimeSlider
            currentHour={currentHour}
            onHourChange={handleHourChange}
          />
        </section>

        {/* Explainable Decision Summary with Hands-Free Audio Advisory */}
        {evaluationData?.decision_summary && (
          <div className="decision-card">
            <Sparkles size={20} className="decision-icon" />
            <div className="decision-text" style={{ flex: 1 }}>
              {evaluationData.decision_summary}
            </div>
            <button
              id="audio-advisory-btn"
              className={`audio-advisory-btn ${isPlayingAudio ? "playing" : ""}`}
              onClick={handleToggleSpeech}
              title="Hands-free audio safety advisory for street pedestrians"
            >
              {isPlayingAudio ? <Square size={11} /> : <Volume2 size={13} />}
              <span>{isPlayingAudio ? "Stop" : "Listen"}</span>
            </button>
          </div>
        )}

        {/* Candidate Routes List */}
        <div className="routes-list">
          <div className="section-label" style={{ marginBottom: "2px" }}>
            <ShieldCheck size={13} />
            <span>Evaluated Candidate Routes ({activeRoutes.length})</span>
          </div>

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

        {/* POI & AWS Quick Action Bar */}
        <div className="layer-controls">
          <button
            id="toggle-hydration-layer"
            className={`poi-toggle-btn ${showHydration ? "active" : ""}`}
            onClick={() => setShowHydration(!showHydration)}
          >
            <Droplets size={15} />
            <span>{showHydration ? "Map Pins (Active)" : "Show Pins"}</span>
          </button>

          <button
            id="toggle-stations-list"
            className={`poi-toggle-btn ${showStationsList ? "active" : ""}`}
            onClick={() => setShowStationsList(!showStationsList)}
          >
            <Navigation size={14} />
            <span>{showStationsList ? "Hide Stations" : `Stations (${evaluationData?.hydration_pois?.length || 0})`}</span>
          </button>

          <button
            id="open-aws-telemetry"
            className="aws-pill-btn"
            onClick={() => setIsAwsModalOpen(true)}
          >
            <Cloud size={15} />
            <span>AWS Telemetry</span>
          </button>
        </div>

        {/* Collapsible Verified Hydration & Recovery Stations Drawer */}
        {showStationsList && evaluationData?.hydration_pois && (
          <div className="hydration-stations-drawer">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-hydration)", textTransform: "uppercase" }}>
                🚰 Verified Drinking Water & Recovery Points
              </span>
              <button 
                onClick={() => setShowStationsList(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={14} />
              </button>
            </div>

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
                      className={`station-waypoint-btn ${isAdded ? "active" : ""}`}
                      onClick={() => handleTogglePitstop(poi.id)}
                    >
                      {isAdded ? "✓ Waypoint Added" : "+ Add Waypoint (+1.5m)"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </aside>

      {/* Main Map View */}
      <main className="map-view-wrapper">
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
        />
      </main>

      {/* AWS Telemetry Modal */}
      <AwsTelemetryModal
        isOpen={isAwsModalOpen}
        onClose={() => setIsAwsModalOpen(false)}
        telemetry={evaluationData?.aws_telemetry}
        isLiveCloud={evaluationData?.is_live_cloud}
      />
    </div>
  );
}
