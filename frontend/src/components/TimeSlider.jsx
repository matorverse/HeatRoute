import React from "react";
import { Sun, Sunrise, Sunset } from "lucide-react";

function TimeSlider({ currentHour, onHourChange, solarAltitude, solarAzimuth }) {
  function formatHour(val) {
    const hours24 = Math.floor(val);
    const minutes = Math.round((val - hours24) * 60);
    const period = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours12}:${formattedMinutes} ${period}`;
  }

  const presets = [
    { label: "09:00 AM", desc: "Morning Shade", hour: 9.0, icon: Sunrise },
    { label: "01:30 PM", desc: "Midday Solar Peak", hour: 13.5, icon: Sun },
    { label: "05:00 PM", desc: "Canyon Shadows", hour: 17.0, icon: Sunset }
  ];

  return (
    <div className="hud-time-container" id="time-travel-slider-container">
      <div className="time-dock-header">
        <div className="time-dock-title-group">
          <div className="time-current-badge">
            <Sun size={15} color="#FBBF24" className="spinning-sun-icon" />
            <span className="time-string-val">{formatHour(currentHour)}</span>
          </div>
          {solarAltitude !== undefined && (
            <div className="solar-angle-mini-pill">
              <span>Alt: {solarAltitude}°</span>
              <span className="dot-sep">·</span>
              <span>Az: {solarAzimuth}°</span>
            </div>
          )}
        </div>

        {/* Quick Diurnal Presets */}
        <div className="diurnal-preset-buttons">
          {presets.map((p, idx) => {
            const Icon = p.icon;
            const isActive = Math.abs(currentHour - p.hour) < 0.3;
            return (
              <button
                key={idx}
                type="button"
                className={`diurnal-btn ${isActive ? "active" : ""}`}
                onClick={() => onHourChange(p.hour)}
                title={`${p.label} - ${p.desc}`}
              >
                <Icon size={12} />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="time-dock-track-wrap">
        <input
          id="departure-time-slider"
          type="range"
          min="8.0"
          max="18.0"
          step="0.25"
          value={currentHour}
          onChange={(e) => onHourChange(parseFloat(e.target.value))}
          className="time-slider-range"
          aria-label="Departure Time Slider"
        />
        <div className="time-slider-ticks">
          <span>08:00 AM</span>
          <span>11:00 AM</span>
          <span className="peak-heat-tick">01:30 PM (Solar Apex)</span>
          <span>04:00 PM</span>
          <span>06:00 PM</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(TimeSlider);
