import React, { useState } from "react";
import { 
  Clock, 
  Shield, 
  AlertTriangle, 
  Trees, 
  Compass, 
  ChevronDown, 
  ChevronUp, 
  Share2, 
  Check, 
  Droplets,
  CloudRain,
  Sun,
  CheckCircle2
} from "lucide-react";

function RouteCard({ 
  route, 
  isSelected, 
  onSelect, 
  activeSeason = "SUMMER",
  corridorName = "",
  onAddPitstop
}) {
  const [showSteps, setShowSteps] = useState(false);
  const [copied, setCopied] = useState(false);

  const isRejected = route.mode === "REJECTED_UNSAFE";

  const modeBadgeClass = {
    FASTEST: "mode-fastest",
    BALANCED: "mode-balanced",
    COOLEST: "mode-coolest",
    SAFEST_DRY: "mode-safest-dry",
    REJECTED_UNSAFE: "mode-rejected"
  }[route.mode] || "mode-balanced";

  const handleKeyDown = (e) => {
    if (!isRejected && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onSelect(route.id);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const text = [
      `🚶‍♂️ HeatRoute Climate Advisory`,
      `📍 Route: ${route.name}`,
      `🏙️ Corridor: ${corridorName || "Delhi Microclimate Testbed"}`,
      `🌡️ Mode: ${route.mode.replace("_", " ")} (${route.exposure_reduction_pct > 0 ? `-${route.exposure_reduction_pct}% Thermal Load vs Fastest` : "Baseline Direct Path"})`,
      `⏱️ Duration: ${route.total_duration_min} mins | Distance: ${(route.total_length_m / 1000).toFixed(2)} km`,
      `🌳 Shade Level: ${route.avg_shade_percentage}% canopy / structure`,
      `💧 Flood / Waterlogging Risk: ${route.waterlogging_risk || "NONE"}`,
      `🛡️ Pedestrian Safety: ${route.safety?.safety_verdict || "VERIFIED"}`,
      `Built for Bharat Build Tour (Track 02: Heat & Water)`
    ].join("\n");

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      });
    }
  };

  return (
    <div
      id={`route-card-${route.id}`}
      className={`route-card ${isSelected ? "selected" : ""} ${isRejected ? "rejected" : ""}`}
      style={{ "--route-color": route.exposure_color }}
      onClick={() => !isRejected && onSelect(route.id)}
      onKeyDown={handleKeyDown}
      tabIndex={isRejected ? -1 : 0}
      role={isRejected ? "region" : "button"}
      aria-pressed={isSelected}
      aria-label={`Route: ${route.name}, ${route.mode.replace("_", " ")}`}
    >
      {/* 1. Header: Route Title + Selected Indicator */}
      <div className="route-card-top-row">
        <div className="route-name-wrap">
          <span className={`route-select-indicator ${isSelected ? "selected" : ""}`} />
          <h3 className="route-title">{route.name}</h3>
        </div>

        {isSelected && (
          <span className="route-active-chip" title="Active on map">
            <CheckCircle2 size={12} />
            <span>ACTIVE</span>
          </span>
        )}
      </div>

      {/* 2. Mode & Exposure Badges */}
      <div className="route-badges-cluster">
        <span className={`route-mode-pill ${modeBadgeClass}`}>
          {route.mode === "SAFEST_DRY" ? "⛈️ SAFEST DRY" : route.mode.replace("_", " ")}
        </span>

        {!isRejected && (
          <span
            className="exposure-pill"
            style={{
              backgroundColor: `${route.exposure_color}1A`,
              color: route.exposure_color,
              border: `1px solid ${route.exposure_color}45`
            }}
          >
            {route.exposure_label} EXPOSURE
          </span>
        )}

        {route.waterlogging_risk && route.waterlogging_risk !== "NONE" && (
          <span 
            className="waterlog-pill" 
            style={{
              color: route.waterlogging_risk === "SEVERE_SUBMERGED" ? "#FF555F" : "#FFBC59",
              backgroundColor: route.waterlogging_risk === "SEVERE_SUBMERGED" ? "rgba(255, 85, 95, 0.15)" : "rgba(255, 188, 89, 0.15)",
              borderColor: route.waterlogging_risk === "SEVERE_SUBMERGED" ? "rgba(255, 85, 95, 0.4)" : "rgba(255, 188, 89, 0.4)"
            }}
          >
            <CloudRain size={11} />
            {route.waterlogging_risk === "SEVERE_SUBMERGED" ? "FLOOD RISK" : "PUDDLE PRONE"}
          </span>
        )}
      </div>

      {!isRejected ? (
        <>
          {/* 3. Stats Grid: ETA, Distance, Shade */}
          <div className="route-stats-grid">
            <div className="stat-card-cell">
              <Clock size={13} className="stat-icon" />
              <div className="stat-cell-content">
                <span className="stat-cell-val">{route.total_duration_min} min</span>
                <span className="stat-cell-sub">
                  {route.detour_percent > 0 ? `+${route.detour_percent}% detour` : "Fastest ETA"}
                </span>
              </div>
            </div>

            <div className="stat-card-cell">
              <Compass size={13} className="stat-icon" />
              <div className="stat-cell-content">
                <span className="stat-cell-val">{(route.total_length_m / 1000).toFixed(1)} km</span>
                <span className="stat-cell-sub">Pedestrian Path</span>
              </div>
            </div>

            <div className="stat-card-cell">
              <Trees size={13} className="stat-icon" />
              <div className="stat-cell-content">
                <span className="stat-cell-val">{route.avg_shade_percentage}%</span>
                <span className="stat-cell-sub">Canopy Cover</span>
              </div>
            </div>
          </div>

          {/* 4. Thermal Comparison against Explicit Baseline */}
          <div className="route-exposure-comparison">
            {route.exposure_reduction_pct > 0 ? (
              <span className="exposure-saving-tag">
                🛡️ <strong>-{route.exposure_reduction_pct}% lower thermal load</strong> vs fastest direct path
              </span>
            ) : (
              <span className="exposure-baseline-tag">
                ⚡ Direct baseline reference path
              </span>
            )}
          </div>

          {/* 5. Selection Details Drawer (Turn-by-turn + microclimate factors) */}
          {isSelected && (
            <div className="factors-box">
              {route.contributing_factors && route.contributing_factors.length > 0 && (
                <div className="factors-list">
                  {route.contributing_factors.map((factor, idx) => (
                    <div key={idx} className="factor-item">
                      <span className="factor-bullet" style={{ color: route.exposure_color }}>●</span>
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions row: Turn-by-turn toggle & Share */}
              <div className="route-actions-bar">
                {route.steps && route.steps.length > 0 && (
                  <button
                    type="button"
                    className="action-link-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSteps(!showSteps);
                    }}
                    aria-expanded={showSteps}
                  >
                    <span>{showSteps ? "Hide Turn-by-Turn" : `Turn-by-Turn Guidance (${route.steps.length})`}</span>
                    {showSteps ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                )}

                <button
                  type="button"
                  className="share-pill-btn"
                  onClick={handleShare}
                  title="Copy formatted route advisory"
                >
                  {copied ? <Check size={12} color="#31D5B0" /> : <Share2 size={12} />}
                  <span>{copied ? "Copied" : "Share"}</span>
                </button>
              </div>

              {/* Expandable Turn-by-Turn Itinerary */}
              {showSteps && route.steps && (
                <div className="steps-itinerary-box">
                  <div className="itinerary-header">
                    <span>🚶 Walking Itinerary Steps</span>
                  </div>
                  {route.steps.map((st, i) => (
                    <div key={i} className="step-itinerary-item">
                      <div className="step-num-badge">{st.step_num}</div>
                      <div className="step-content">
                        <div className="step-instruction">{st.instruction}</div>
                        <div className="step-meta">
                          <span className="step-distance">{st.distance_m}m</span>
                          <span className="step-shade">🍃 {st.shade_info}</span>
                        </div>
                        {st.water_nearby && (
                          <div className="step-water-callout">
                            <Droplets size={11} color="#42D5FF" />
                            <span>{st.water_nearby}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="route-confidence-tag">
                Source Confidence: <strong style={{ color: "#31D5B0" }}>{route.confidence}</strong> · Verified Canopy & OSRM Pedestrian Mesh
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="safety-alert">
          <div className="safety-alert-header">
            <AlertTriangle size={15} color="#FF555F" />
            <span>SAFETY FILTER DISQUALIFICATION</span>
          </div>
          <div className="safety-alert-body">
            {route.safety?.violations?.[0] || "Route fails pedestrian safety parameters."}
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(RouteCard);

