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
  Sun
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
      `🌡️ Mode: ${route.mode.replace("_", " ")} (${route.exposure_reduction_pct > 0 ? `-${route.exposure_reduction_pct}% Thermal Load` : "Baseline"})`,
      `⏱️ Duration: ${route.total_duration_min} mins | Distance: ${(route.total_length_m / 1000).toFixed(2)} km`,
      `🌳 Shade Level: ${route.avg_shade_percentage}% canopy / structure`,
      `💧 Flood / Waterlogging Risk: ${route.waterlogging_risk || "NONE"}`,
      `🛡️ Pedestrian Safety: ${route.safety?.safety_verdict || "VERIFIED"}`,
      `Built for WeMakeDevs Bharat Builds Tour (Track 02: Heat & Water)`
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
    >
      <div className="route-card-header">
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <span className={`route-mode-pill ${modeBadgeClass}`}>
            {route.mode === "SAFEST_DRY" ? "⛈️ SAFEST DRY" : route.mode.replace("_", " ")}
          </span>

          {route.waterlogging_risk && route.waterlogging_risk !== "NONE" && (
            <span 
              className="waterlog-pill" 
              style={{
                color: route.waterlogging_risk === "SEVERE_SUBMERGED" ? "#EF4444" : "#F59E0B",
                backgroundColor: route.waterlogging_risk === "SEVERE_SUBMERGED" ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)"
              }}
            >
              <CloudRain size={11} />
              {route.waterlogging_risk === "SEVERE_SUBMERGED" ? "FLOOD RISK" : "PUDDLE PRONE"}
            </span>
          )}
        </div>

        {!isRejected && (
          <span
            className="exposure-pill"
            style={{
              backgroundColor: `${route.exposure_color}25`,
              color: route.exposure_color,
              border: `1px solid ${route.exposure_color}50`
            }}
          >
            {route.exposure_label} EXPOSURE
          </span>
        )}
      </div>

      <div className="route-title">{route.name}</div>

      {!isRejected ? (
        <>
          <div className="route-stats-row">
            <div className="stat-item">
              <Clock size={15} />
              <span className="stat-highlight">{route.total_duration_min} min</span>
              {route.detour_percent > 0 && (
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  (+{route.detour_percent}%)
                </span>
              )}
            </div>

            <div className="stat-item">
              <Trees size={15} />
              <span>{route.avg_shade_percentage}% Shade</span>
            </div>

            <div className="stat-item">
              <Compass size={15} />
              <span>{(route.total_length_m / 1000).toFixed(1)} km</span>
            </div>
          </div>

          {route.exposure_reduction_pct > 0 && (
            <div className="route-tradeoff-note">
              <span>🛡️ -{route.exposure_reduction_pct}% lower thermal load</span>
            </div>
          )}

          {isSelected && (
            <div className="factors-box">
              {route.contributing_factors.map((factor, idx) => (
                <div key={idx} className="factor-item">
                  <span style={{ color: route.exposure_color }}>●</span>
                  <span>{factor}</span>
                </div>
              ))}

              {/* Turn-by-Turn Expand Button & Share Actions */}
              <div className="route-actions-bar">
                {route.steps && route.steps.length > 0 && (
                  <button
                    className="action-link-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSteps(!showSteps);
                    }}
                  >
                    <span>{showSteps ? "Hide Itinerary" : `Turn-by-Turn Steps (${route.steps.length})`}</span>
                    {showSteps ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}

                <button
                  className="share-pill-btn"
                  onClick={handleShare}
                  title="Copy formatted route advisory for mobile/WhatsApp"
                >
                  {copied ? <Check size={13} color="#10B981" /> : <Share2 size={13} />}
                  <span>{copied ? "Copied!" : "Share Advisory"}</span>
                </button>
              </div>

              {/* Expandable Turn-by-Turn Itinerary Drawer */}
              {showSteps && route.steps && (
                <div className="steps-itinerary-box">
                  <div className="itinerary-header">
                    <span>🚶 Turn-by-Turn Guidance</span>
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
                            <Droplets size={12} color="#38BDF8" />
                            <span>{st.water_nearby}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: "4px", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                Confidence: <strong style={{ color: "#10B981" }}>{route.confidence}</strong> (Geospatial & Canopy Data)
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="safety-alert">
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "700" }}>
            <AlertTriangle size={15} color="#EF4444" />
            <span>DISQUALIFIED BY SAFETY FILTER</span>
          </div>
          <div style={{ marginTop: "4px", color: "var(--text-secondary)" }}>
            {route.safety.violations[0]}
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(RouteCard);
