import React, { useState, useEffect, useCallback } from "react";
import { 
  Flame, 
  Droplets, 
  MapPin, 
  Info, 
  Cloud, 
  Sparkles,
  Thermometer,
  ShieldCheck
} from "lucide-react";

import MapView from "./components/MapView";
import RouteCard from "./components/RouteCard";
import TimeSlider from "./components/TimeSlider";
import AwsTelemetryModal from "./components/AwsTelemetryModal";
import { fetchRouteEvaluation } from "./services/api";

export default function App() {
  const [currentHour, setCurrentHour] = useState(13.5); // Default: 1:30 PM (Peak Delhi Heat)
  const [evaluationData, setEvaluationData] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [showHydration, setShowHydration] = useState(true);
  const [isAwsModalOpen, setIsAwsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Recalculate routes with smooth 100ms debounce during slider interaction
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const hours = Math.floor(currentHour);
    const mins = Math.round((currentHour - hours) * 60);
    const hourStr = hours < 10 ? `0${hours}` : `${hours}`;
    const minStr = mins < 10 ? `0${mins}` : `${mins}`;
    const isoString = `2026-06-15T${hourStr}:${minStr}:00+05:30`;

    const timer = setTimeout(() => {
      fetchRouteEvaluation({
        departureTime: isoString,
        ambientTempC: currentHour >= 16 ? 40.0 : 43.5,
        humidityPct: currentHour >= 16 ? 45.0 : 42.0,
        modePreference: "BALANCED"
      }).then(data => {
        if (isMounted) {
          setEvaluationData(data);
          setIsLoading(false);
          // Preserve currently selected route if valid, otherwise fallback to recommended
          setSelectedRouteId(prev => {
            if (prev && data.routes?.some(r => r.id === prev)) {
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
  }, [currentHour]);

  const handleSelectRoute = useCallback((id) => {
    setSelectedRouteId(id);
  }, []);

  const handleHourChange = useCallback((val) => {
    setCurrentHour(val);
  }, []);

  const activeRoutes = evaluationData?.routes || [];
  const selectedRoute = activeRoutes.find(r => r.id === selectedRouteId) || activeRoutes[0];

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
            Safety-constrained, thermal-aware pedestrian route optimization layer for Indian cities.
          </p>
        </header>

        {/* Microclimate Corridor Info */}
        <section className="control-section">
          <div className="section-label">
            <MapPin size={13} />
            <span>Active Corridor Testbed</span>
          </div>

          <div className="corridor-banner">
            <div className="corridor-title">
              <span>Connaught Place ➔ Mandi House</span>
            </div>
            <div className="corridor-endpoints">
              <span style={{ color: "#10B981" }}>● Origin: Rajiv Chowk Metro (Gate 2)</span>
              <span>➔</span>
              <span style={{ color: "#EF4444" }}>● Dest: Mandi House</span>
            </div>
          </div>

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
              <span className="metric-pill-label">Heat Index</span>
              <span className="metric-pill-value" style={{ color: "var(--color-accent)" }}>
                {evaluationData?.heat_index_c || 59.8}°C
              </span>
            </div>
          </div>

          {/* Interactive Time-Travel Slider */}
          <TimeSlider
            currentHour={currentHour}
            onHourChange={handleHourChange}
          />
        </section>

        {/* Explainable Decision Summary */}
        {evaluationData?.decision_summary && (
          <div className="decision-card">
            <Sparkles size={20} className="decision-icon" />
            <div className="decision-text">
              {evaluationData.decision_summary}
            </div>
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
            <Droplets size={16} />
            <span>{showHydration ? "Hide Water & Rest Stops" : "Show Water & Rest Stops (7)"}</span>
          </button>

          <button
            id="open-aws-telemetry"
            className="aws-pill-btn"
            onClick={() => setIsAwsModalOpen(true)}
          >
            <Cloud size={16} />
            <span>AWS Telemetry</span>
          </button>
        </div>
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
