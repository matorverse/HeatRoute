import React, { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const DARK_MAP_STYLE = {
  version: 8,
  sources: {
    "carto-dark": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
      ],
      tileSize: 256,
      attribution: "© CARTO, © OpenStreetMap"
    }
  },
  layers: [
    {
      id: "carto-dark-layer",
      type: "raster",
      source: "carto-dark",
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

const AWS_REGION = import.meta.env.VITE_AWS_REGION || "ap-southeast-2";
const AWS_MAP_NAME = import.meta.env.VITE_AWS_LOCATION_MAP_NAME;
const AWS_STYLE_NAME = import.meta.env.VITE_AWS_LOCATION_STYLE || "Standard";
const AWS_API_KEY = import.meta.env.VITE_AWS_LOCATION_API_KEY;

// Check if AWS Location Service credentials are provided
const hasAwsLocationConfig = Boolean(AWS_API_KEY);

// Support both AWS Location V2 (Standard/Monochrome vector tiles) and V0 (legacy named map)
const AWS_STYLE_URL = hasAwsLocationConfig
  ? (AWS_MAP_NAME
      ? `https://maps.geo.${AWS_REGION}.amazonaws.com/maps/v0/maps/${AWS_MAP_NAME}/style-descriptor?key=${AWS_API_KEY}`
      : `https://maps.geo.${AWS_REGION}.amazonaws.com/v2/styles/${AWS_STYLE_NAME}/descriptor?key=${AWS_API_KEY}&color-scheme=Dark`)
  : null;

export default function MapView({
  routes = [],
  selectedRouteId,
  onSelectRoute,
  hydrationPois = [],
  showHydration,
  solarAltitude = 70,
  solarAzimuth = 280
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // Initialize MapLibre with Amazon Location Service or Carto Fallback
  useEffect(() => {
    if (mapRef.current) return;

    const initialStyle = AWS_STYLE_URL || DARK_MAP_STYLE;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: [77.2270, 28.6293], // Central Delhi (CP - Mandi House)
      zoom: 14.5,
      pitch: 35,
      bearing: -15,
      attributionControl: false,
      transformRequest: (url) => {
        // Automatically attach API Key to AWS Location Service tile/sprite/glyph requests
        if (AWS_API_KEY && url.includes("amazonaws.com") && !url.includes("key=")) {
          const sep = url.includes("?") ? "&" : "?";
          return { url: `${url}${sep}key=${AWS_API_KEY}` };
        }
        return { url };
      }
    });

    // Handle fallback if AWS style fails to load (e.g., expired key or network blockage)
    map.on("error", (e) => {
      if (AWS_STYLE_URL && (e?.error?.message?.includes("style") || e?.error?.status === 403)) {
        console.warn("Notice: AWS Location Service style load issue, falling back to local base style:", e);
        try {
          map.setStyle(DARK_MAP_STYLE);
        } catch (_) {}
      }
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "bottom-right");

    map.on("load", () => {
      mapRef.current = map;
      updateRouteLayers(map, routes, selectedRouteId);
      updatePoiMarkers(map, hydrationPois, showHydration);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Route Layers when routes or selectedRouteId changes
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;
    updateRouteLayers(mapRef.current, routes, selectedRouteId);
  }, [routes, selectedRouteId]);

  // Update Hydration POIs
  useEffect(() => {
    if (!mapRef.current) return;
    updatePoiMarkers(mapRef.current, hydrationPois, showHydration);
  }, [hydrationPois, showHydration]);

  function updateRouteLayers(map, routeList, activeId) {
    // Clean up existing route layers
    const existingLayers = ["route-layer-inactive", "route-layer-active", "route-layer-glow"];
    existingLayers.forEach(id => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    if (map.getSource("routes-source")) {
      map.removeSource("routes-source");
    }

    if (!routeList || routeList.length === 0) return;

    // Build GeoJSON FeatureCollection
    const features = routeList
      .filter(r => r.path_coordinates && r.path_coordinates.length > 1)
      .map(r => ({
        type: "Feature",
        properties: {
          id: r.id,
          name: r.name,
          mode: r.mode,
          color: r.exposure_color || "#38BDF8",
          isSelected: r.id === activeId,
          isRejected: r.mode === "REJECTED_UNSAFE"
        },
        geometry: {
          type: "LineString",
          coordinates: r.path_coordinates
        }
      }));

    map.addSource("routes-source", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features
      }
    });

    // Inactive / background routes
    map.addLayer({
      id: "route-layer-inactive",
      type: "line",
      source: "routes-source",
      filter: ["!=", ["get", "id"], activeId || ""],
      paint: {
        "line-color": ["get", "color"],
        "line-width": 4,
        "line-opacity": 0.35,
        "line-dasharray": [2, 1]
      }
    });

    // Selected Route Glow Layer
    map.addLayer({
      id: "route-layer-glow",
      type: "line",
      source: "routes-source",
      filter: ["==", ["get", "id"], activeId || ""],
      paint: {
        "line-color": ["get", "color"],
        "line-width": 14,
        "line-opacity": 0.25,
        "line-blur": 6
      }
    });

    // Selected Route Core Layer
    map.addLayer({
      id: "route-layer-active",
      type: "line",
      source: "routes-source",
      filter: ["==", ["get", "id"], activeId || ""],
      paint: {
        "line-color": ["get", "color"],
        "line-width": 6,
        "line-opacity": 0.95
      }
    });

    // Click handler on routes
    map.on("click", "route-layer-inactive", (e) => {
      if (e.features && e.features[0]) {
        const clickedId = e.features[0].properties.id;
        if (onSelectRoute) onSelectRoute(clickedId);
      }
    });

    // Ensure Start and End markers are in place
    renderOriginDestinationMarkers(map);
  }

  function renderOriginDestinationMarkers(map) {
    // Only render once
    if (map._originMarker) return;

    // Origin: Rajiv Chowk Metro Gate 2
    const elOrigin = document.createElement("div");
    elOrigin.className = "marker-origin";
    elOrigin.innerHTML = "A";
    elOrigin.title = "Origin: Rajiv Chowk Metro (Gate 2)";

    const originMarker = new maplibregl.Marker({ element: elOrigin })
      .setLngLat([77.2195, 28.6328])
      .addTo(map);

    // Destination: Mandi House Metro
    const elDest = document.createElement("div");
    elDest.className = "marker-dest";
    elDest.innerHTML = "B";
    elDest.title = "Destination: Mandi House Metro Interchange";

    const destMarker = new maplibregl.Marker({ element: elDest })
      .setLngLat([77.2345, 28.6258])
      .addTo(map);

    map._originMarker = originMarker;
    map._destMarker = destMarker;
  }

  function updatePoiMarkers(map, pois, isVisible) {
    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (!isVisible || !pois) return;

    pois.forEach(poi => {
      const el = document.createElement("div");
      el.className = "marker-water";
      el.innerHTML = "💧";
      el.title = poi.name;

      const popup = new maplibregl.Popup({ offset: 15, closeButton: false }).setHTML(`
        <div style="font-family: sans-serif; font-size: 12px; color: #111827; padding: 4px;">
          <strong style="color: #0284C7;">${poi.name}</strong><br/>
          <span style="color: #4B5563;">Type: ${poi.type.replace(/_/g, ' ')}</span><br/>
          <span style="color: #10B981; font-weight: 600;">● ${poi.verified_status}</span><br/>
          <small style="color: #6B7280;">${poi.features.join(", ")}</small>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(poi.coordinates)
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }

  return (
    <div className="map-view-wrapper">
      <div id="maplibre-canvas" ref={mapContainerRef} />
      
      {/* Map Engine Provider Badge */}
      <div className="map-floating-badge" style={{ left: "20px", right: "auto", padding: "8px 14px" }}>
        <span style={{ fontSize: "1rem" }}>{hasAwsLocationConfig ? "☁️" : "🗺️"}</span>
        <div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Map Engine
          </div>
          <div style={{ fontSize: "0.78rem", fontWeight: "700", color: hasAwsLocationConfig ? "#FF9900" : "var(--color-primary)" }}>
            {hasAwsLocationConfig ? `AWS Location (${AWS_MAP_NAME || AWS_STYLE_NAME})` : "Carto Dark (Fallback)"}
          </div>
        </div>
      </div>

      {/* Real-time Solar Angle Floating Badge */}
      <div className="map-floating-badge">
        <span className="floating-sun-icon">☀️</span>
        <div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Solar Vector</div>
          <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-solar)" }}>
            Alt: {solarAltitude}° | Az: {solarAzimuth}°
          </div>
        </div>
      </div>
    </div>
  );
}
