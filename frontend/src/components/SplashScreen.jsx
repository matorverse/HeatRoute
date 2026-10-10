import React, { useState, useEffect } from "react";
import { Flame, ShieldCheck, Sparkles } from "lucide-react";

export default function SplashScreen({ onComplete }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const steps = [
    "Connecting to Amazon Location Service Vector Mesh...",
    "Calibrating Solar Geometries & Heritage Canopy Models...",
    "Synthesizing Track 02 Dual-Hazard Routing Engine..."
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setStepIndex(1), 380);
    const timer2 = setTimeout(() => setStepIndex(2), 750);
    const timer3 = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 500);
    }, 1250);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className={`splash-overlay ${isFadingOut ? "fade-out" : ""}`}>
      <div className="splash-card">
        {/* Animated Thermal Radar Ring */}
        <div className="splash-radar-wrapper">
          <div className="radar-ring ring-3" />
          <div className="radar-ring ring-2" />
          <div className="radar-ring ring-1" />
          <div className="splash-icon-core">
            <Flame size={36} color="#FF6B2B" className="splash-flame-icon" />
          </div>
        </div>

        <div className="splash-brand-block">
          <h1 className="splash-brand-title">HeatRoute</h1>
          <div className="splash-track-pill">
            <Sparkles size={11} color="#38BDF8" />
            <span>Track 02 · Heat & Water · WeMakeDevs Bharat Builds</span>
          </div>
        </div>

        <div className="splash-progress-wrapper">
          <div className="splash-progress-bar">
            <div 
              className="splash-progress-fill" 
              style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} 
            />
          </div>
          <p className="splash-step-text">{steps[stepIndex]}</p>
        </div>
      </div>
    </div>
  );
}
