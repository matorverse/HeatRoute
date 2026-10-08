import React from "react";
import { Sun } from "lucide-react";

export default function TimeSlider({ currentHour, onHourChange }) {
  // Convert fractional hour (e.g. 13.5) to formatted time string (e.g. "01:30 PM")
  function formatHour(val) {
    const hours24 = Math.floor(val);
    const minutes = Math.round((val - hours24) * 60);
    const period = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours12}:${formattedMinutes} ${period}`;
  }

  return (
    <div className="slider-container" id="time-travel-slider-container">
      <div className="slider-header">
        <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "500" }}>
          Departure Time (Solar Angle Simulation)
        </span>
        <div className="time-display" id="departure-time-display">
          <Sun size={17} />
          <span>{formatHour(currentHour)}</span>
        </div>
      </div>

      <input
        id="departure-time-slider"
        type="range"
        min="8.0"
        max="18.0"
        step="0.25"
        value={currentHour}
        onChange={(e) => onHourChange(parseFloat(e.target.value))}
        className="slider-input"
        aria-label="Departure Time Slider"
      />

      <div className="slider-ticks">
        <span>08:00 AM (Morning)</span>
        <span style={{ color: "var(--color-accent)", fontWeight: "600" }}>01:30 PM (Peak Heat)</span>
        <span>06:00 PM (Dusk)</span>
      </div>
    </div>
  );
}
