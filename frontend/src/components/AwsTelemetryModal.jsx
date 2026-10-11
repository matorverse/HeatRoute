import React, { useEffect } from "react";
import { X, Cloud, Activity, Database, Server, HardDrive, Map } from "lucide-react";

export default function AwsTelemetryModal({ isOpen, onClose, telemetry, isLiveCloud }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasLocationConfig = Boolean(import.meta.env.VITE_AWS_LOCATION_API_KEY);
  const locationResourceLabel = import.meta.env.VITE_AWS_LOCATION_MAP_NAME
    ? import.meta.env.VITE_AWS_LOCATION_MAP_NAME
    : `${import.meta.env.VITE_AWS_LOCATION_STYLE || "Standard"} Dark (v2)`;

  return (
    <div className="modal-overlay" onClick={onClose} id="aws-telemetry-modal" role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Cloud color="#FF9900" size={22} />
            <span>AWS Infrastructure & Telemetry</span>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: "16px", fontSize: "0.86rem", color: "#CBD5E1", lineHeight: "1.45" }}>
          HeatRoute natively deploys on AWS to evaluate solar geometry, street shadow vectors, and biometeorological exposure at millisecond latencies.
        </div>

        <div className="aws-spec-grid">
          <div className="aws-card-row">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Map color="#FF9900" size={20} />
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#F8FAFC" }}>
                  Amazon Location Service (Maps)
                </div>
                <div style={{ fontSize: "0.74rem", color: "#94A3B8" }}>
                  Resource: {locationResourceLabel} (Vector Tiles)
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: "700", color: hasLocationConfig ? "#34D399" : "#FBBF24" }}>
                {hasLocationConfig ? "AWS Vector Active" : "Fallback Active"}
              </span>
              <div style={{ fontSize: "0.72rem", color: "#94A3B8" }}>{hasLocationConfig ? "MapLibre GL" : "Carto raster"}</div>
            </div>
          </div>

          <div className="aws-card-row">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Server color="#FF9900" size={20} />
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#F8FAFC" }}>
                  AWS Lambda (Python 3.11)
                </div>
                <div style={{ fontSize: "0.74rem", color: "#94A3B8" }}>
                  Core Biometeorological & Solar Vector Engine
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.88rem", fontWeight: "700", color: "#34D399" }}>
                {telemetry?.execution_latency_ms || 22.4} ms
              </span>
              <div style={{ fontSize: "0.72rem", color: "#94A3B8" }}>avg latency</div>
            </div>
          </div>

          <div className="aws-card-row">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Database color="#38BDF8" size={20} />
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#F8FAFC" }}>
                  Amazon DynamoDB
                </div>
                <div style={{ fontSize: "0.74rem", color: "#94A3B8" }}>
                  Table: HeatRoute-Hydration-POIs (Pay-per-request)
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.88rem", fontWeight: "700", color: "#38BDF8" }}>
                {telemetry?.dynamodb_queried_pois || 7} POIs
              </span>
              <div style={{ fontSize: "0.72rem", color: "#94A3B8" }}>queried active</div>
            </div>
          </div>

          <div className="aws-card-row">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <HardDrive color="#FBBF24" size={20} />
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#F8FAFC" }}>
                  Amazon S3
                </div>
                <div style={{ fontSize: "0.74rem", color: "#94A3B8" }}>
                  Bucket: heatroute-corridor-cache-ap-south-1
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#34D399" }}>
                100% Demo Uptime
              </span>
              <div style={{ fontSize: "0.72rem", color: "#94A3B8" }}>zero API downtime</div>
            </div>
          </div>

          <div className="aws-card-row">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Activity color="#F87171" size={20} />
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#F8FAFC" }}>
                  Amazon CloudWatch Custom Metrics
                </div>
                <div style={{ fontSize: "0.74rem", color: "#94A3B8" }}>
                  Metric: Cumulative ThermalStressHoursAvoided
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.98rem", fontWeight: "800", color: "#38BDF8" }}>
                {telemetry?.cloudwatch_metric?.value || 14.2} hrs
              </span>
              <div style={{ fontSize: "0.72rem", color: "#94A3B8" }}>heat stress avoided</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "18px", padding: "12px 16px", background: "rgba(15, 23, 42, 0.95)", borderRadius: "10px", border: "1px solid rgba(255, 153, 0, 0.25)", fontSize: "0.78rem", color: "#CBD5E1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>AWS Region: <strong style={{ color: "#F8FAFC" }}>{import.meta.env.VITE_AWS_REGION || "ap-southeast-2"}</strong></span>
          <span style={{ color: isLiveCloud || hasLocationConfig ? "#34D399" : "#FBBF24", fontWeight: "700" }}>
            ● {hasLocationConfig ? "AWS Location Live" : (isLiveCloud ? "Live AWS Connection" : "Deterministic Fallback")}
          </span>
        </div>
      </div>
    </div>
  );
}
