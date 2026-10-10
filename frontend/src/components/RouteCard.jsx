import React from "react";
import { Clock, Shield, AlertTriangle, Trees, Compass } from "lucide-react";

function RouteCard({ route, isSelected, onSelect }) {
  const isRejected = route.mode === "REJECTED_UNSAFE";

  const modeBadgeClass = {
    FASTEST: "mode-fastest",
    BALANCED: "mode-balanced",
    COOLEST: "mode-coolest",
    REJECTED_UNSAFE: "mode-rejected"
  }[route.mode] || "mode-balanced";

  const handleKeyDown = (e) => {
    if (!isRejected && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onSelect(route.id);
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
        <span className={`route-mode-pill ${modeBadgeClass}`}>
          {route.mode.replace("_", " ")}
        </span>

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
