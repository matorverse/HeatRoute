import React, { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

// Set web worker explicitly for Vite bundling
if (typeof maplibregl.setWorkerUrl === "function") {
  maplibregl.setWorkerUrl(maplibreWorkerUrl);
}

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

function MapView({
  routes = [],
  selectedRouteId,
  onSelectRoute,
  hydrationPois = [],
  showHydration,
  solarAltitude = 70,
  solarAzimuth = 280,
  activeCorridor,
  activePitstopPoiId,
  onTogglePitstop,
  isCustomMode = false,
  customPoints = { origin: null, destination: null },
  onMapClickPoint
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const pitstopMarkerRef = useRef(null);
  const currentCorridorIdRef = useRef(activeCorridor?.id);

  // Initialize MapLibre with Amazon Location Service or Carto Fallback
  useEffect(() => {
    if (mapRef.current) return;

    const initialStyle = AWS_STYLE_URL || DARK_MAP_STYLE;
    const initialOrigin = activeCorridor?.origin?.coordinates || [77.2195, 28.6328];
    const initialDest = activeCorridor?.destination?.coordinates || [77.2345, 28.6258];
    const centerLon = (initialOrigin[0] + initialDest[0]) / 2;
    const centerLat = (initialOrigin[1] + initialDest[1]) / 2;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: [centerLon, centerLat],
      zoom: activeCorridor?.default_zoom || 14.5,
      pitch: 35,
      bearing: -15,
      attributionControl: false,
      transformRequest: (url) => {
        if (AWS_API_KEY && url.includes("amazonaws.com") && !url.includes("key=")) {
          const sep = url.includes("?") ? "&" : "?";
          return { url: `${url}${sep}key=${AWS_API_KEY}` };
        }
        return { url };
      }
    });

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
      updateOriginDestinationMarkers(map, activeCorridor);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Route Layers when routes or selectedRouteId changes
  useEffect(() => {
    if (!mapRef.current) return;
    const applyRoutes = () => {
      if (mapRef.current && mapRef.current.isStyleLoaded()) {
        updateRouteLayers(mapRef.current, routes, selectedRouteId);
      }
    };

    if (mapRef.current.isStyleLoaded()) {
      applyRoutes();
    } else {
      mapRef.current.once("load", applyRoutes);
      mapRef.current.on("styledata", applyRoutes);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off("styledata", applyRoutes);
      }
    };
  }, [routes, selectedRouteId]);

  // Update Hydration POIs
  useEffect(() => {
    if (!mapRef.current) return;
    const applyPois = () => {
      if (mapRef.current && mapRef.current.isStyleLoaded()) {
        updatePoiMarkers(mapRef.current, hydrationPois, showHydration);
      }
    };

    if (mapRef.current.isStyleLoaded()) {
      applyPois();
    } else {
      mapRef.current.once("load", applyPois);
    }
  }, [hydrationPois, showHydration, activePitstopPoiId]);

  // Handle Corridor Switching or Custom Point Placement (FlyTo / FitBounds)
  useEffect(() => {
    if (!mapRef.current) return;
    
    updateOriginDestinationMarkers(mapRef.current, activeCorridor, isCustomMode, customPoints);

    if (isCustomMode) {
      if (customPoints && customPoints.origin && customPoints.destination) {
        const minLon = Math.min(customPoints.origin[0], customPoints.destination[0]);
        const maxLon = Math.max(customPoints.origin[0], customPoints.destination[0]);
        const minLat = Math.min(customPoints.origin[1], customPoints.destination[1]);
        const maxLat = Math.max(customPoints.origin[1], customPoints.destination[1]);
        mapRef.current.fitBounds(
          [[minLon, minLat], [maxLon, maxLat]],
          { padding: { top: 140, bottom: 140, left: 460, right: 140 }, duration: 900 }
        );
      }
      return;
    }

    if (!activeCorridor) return;

    if (currentCorridorIdRef.current !== activeCorridor.id) {
      currentCorridorIdRef.current = activeCorridor.id;
      const origin = activeCorridor.origin?.coordinates || [77.2195, 28.6328];
      const dest = activeCorridor.destination?.coordinates || [77.2345, 28.6258];
      const centerLon = (origin[0] + dest[0]) / 2;
      const centerLat = (origin[1] + dest[1]) / 2;

      mapRef.current.flyTo({
        center: [centerLon, centerLat],
        zoom: activeCorridor.default_zoom || 14.5,
        pitch: 35,
        bearing: -15,
        duration: 1000
      });
    }
  }, [activeCorridor, isCustomMode, customPoints]);

  // Interactive click handler on Map canvas for Point-to-Point routing
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const handleCanvasClick = (e) => {
      if (isCustomMode && onMapClickPoint) {
        onMapClickPoint([e.lngLat.lng, e.lngLat.lat]);
      }
    };

    if (isCustomMode) {
      map.getCanvas().style.cursor = "crosshair";
    } else {
      map.getCanvas().style.cursor = "";
    }

    map.on("click", handleCanvasClick);
    return () => {
      map.off("click", handleCanvasClick);
    };
  }, [isCustomMode, onMapClickPoint]);

  // Handle Pitstop POI Marker Highlighting
  useEffect(() => {
    if (!mapRef.current) return;
    if (pitstopMarkerRef.current) {
      pitstopMarkerRef.current.remove();
      pitstopMarkerRef.current = null;
    }

    if (activePitstopPoiId && hydrationPois) {
      const poi = hydrationPois.find(p => p.id === activePitstopPoiId);
      if (poi && poi.coordinates) {
        const el = document.createElement("div");
        el.className = "marker-pitstop-active";
        el.innerHTML = "💧";
        el.title = `Active Hydration Pitstop: ${poi.name}`;

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(poi.coordinates)
          .addTo(mapRef.current);

        pitstopMarkerRef.current = marker;
      }
    }
  }, [activePitstopPoiId, hydrationPois]);

  function updateRouteLayers(map, routeList, activeId) {
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

    const geojsonData = {
      type: "FeatureCollection",
      features
    };

    const source = map.getSource("routes-source");

    if (source) {
      source.setData(geojsonData);
      map.setFilter("route-layer-inactive", ["!=", ["get", "id"], activeId || ""]);
      map.setFilter("route-layer-glow", ["==", ["get", "id"], activeId || ""]);
      map.setFilter("route-layer-active", ["==", ["get", "id"], activeId || ""]);
    } else {
      map.addSource("routes-source", {
        type: "geojson",
        data: geojsonData
      });

      // Inactive routes
      map.addLayer({
        id: "route-layer-inactive",
        type: "line",
        source: "routes-source",
        filter: ["!=", ["get", "id"], activeId || ""],
        paint: {
          "line-color": ["get", "color"],
          "line-width": 4,
          "line-opacity": 0.4,
          "line-dasharray": [2, 1]
        }
      });

      // Glow layer
      map.addLayer({
        id: "route-layer-glow",
        type: "line",
        source: "routes-source",
        filter: ["==", ["get", "id"], activeId || ""],
        paint: {
          "line-color": ["get", "color"],
          "line-width": 14,
          "line-opacity": 0.28,
          "line-blur": 6
        }
      });

      // Active core line
      map.addLayer({
        id: "route-layer-active",
        type: "line",
        source: "routes-source",
        filter: ["==", ["get", "id"], activeId || ""],
        paint: {
          "line-color": ["get", "color"],
          "line-width": 6,
          "line-opacity": 0.98
        }
      });

      map.on("click", "route-layer-inactive", (e) => {
        if (e.features && e.features[0]) {
          const clickedId = e.features[0].properties.id;
          if (onSelectRoute) onSelectRoute(clickedId);
        }
      });

      map.on("mouseenter", "route-layer-inactive", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "route-layer-inactive", () => {
        map.getCanvas().style.cursor = "";
      });
    }
  }

  function updateOriginDestinationMarkers(map, corridor, customMode = false, pts = { origin: null, destination: null }) {
    if (customMode) {
      if (pts && pts.origin) {
        if (map._originMarker) {
          map._originMarker.setLngLat(pts.origin);
        } else {
          const elOrigin = document.createElement("div");
          elOrigin.className = "marker-origin custom-origin-pin";
          elOrigin.innerHTML = "A";
          elOrigin.title = `Custom Origin (${pts.origin[1].toFixed(4)}, ${pts.origin[0].toFixed(4)})`;
          map._originMarker = new maplibregl.Marker({ element: elOrigin })
            .setLngLat(pts.origin)
            .addTo(map);
        }
      } else if (map._originMarker) {
        map._originMarker.remove();
        map._originMarker = null;
      }

      if (pts && pts.destination) {
        if (map._destMarker) {
          map._destMarker.setLngLat(pts.destination);
        } else {
          const elDest = document.createElement("div");
          elDest.className = "marker-dest custom-dest-pin";
          elDest.innerHTML = "B";
          elDest.title = `Custom Destination (${pts.destination[1].toFixed(4)}, ${pts.destination[0].toFixed(4)})`;
          map._destMarker = new maplibregl.Marker({ element: elDest })
            .setLngLat(pts.destination)
            .addTo(map);
        }
      } else if (map._destMarker) {
        map._destMarker.remove();
        map._destMarker = null;
      }
      return;
    }

    if (!corridor) return;
    const originCoords = corridor.origin?.coordinates || [77.2195, 28.6328];
    const destCoords = corridor.destination?.coordinates || [77.2345, 28.6258];

    if (map._originMarker) {
      map._originMarker.setLngLat(originCoords);
      map._originMarker.getElement().title = `Origin: ${corridor.origin?.name || "Origin"}`;
    } else {
      const elOrigin = document.createElement("div");
      elOrigin.className = "marker-origin";
      elOrigin.innerHTML = "A";
      elOrigin.title = `Origin: ${corridor.origin?.name || "Origin"}`;
      map._originMarker = new maplibregl.Marker({ element: elOrigin })
        .setLngLat(originCoords)
        .addTo(map);
    }

    if (map._destMarker) {
      map._destMarker.setLngLat(destCoords);
      map._destMarker.getElement().title = `Destination: ${corridor.destination?.name || "Destination"}`;
    } else {
      const elDest = document.createElement("div");
      elDest.className = "marker-dest";
      elDest.innerHTML = "B";
      elDest.title = `Destination: ${corridor.destination?.name || "Destination"}`;
      map._destMarker = new maplibregl.Marker({ element: elDest })
        .setLngLat(destCoords)
        .addTo(map);
    }
  }

  function updatePoiMarkers(map, pois, isVisible) {
    // Clear old markers if POI list changed
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
    }

    if (!pois || pois.length === 0) return;

    pois.forEach(poi => {
      const el = document.createElement("div");
      el.className = "marker-water";
      el.innerHTML = "💧";
      el.title = poi.name;
      el.style.display = isVisible ? "flex" : "none";

      const isCurrentPitstop = (activePitstopPoiId === poi.id);

      const popup = new maplibregl.Popup({ offset: 15, closeButton: true }).setHTML(`
        <div style="font-family: sans-serif; font-size: 12px; color: #111827; padding: 4px; min-width: 170px;">
          <strong style="color: #0284C7; font-size: 13px;">${poi.name}</strong><br/>
          <span style="color: #4B5563;">Type: ${poi.type.replace(/_/g, ' ')}</span><br/>
          <span style="color: #10B981; font-weight: 600;">● ${poi.verified_status}</span><br/>
          <small style="color: #6B7280;">${poi.features?.join(", ") || ""}</small>
          <div style="margin-top: 8px;">
            <button 
              id="btn-pitstop-${poi.id}" 
              style="width: 100%; padding: 5px 8px; font-size: 11px; font-weight: 600; border-radius: 4px; cursor: pointer; border: 1px solid ${isCurrentPitstop ? '#EF4444' : '#0284C7'}; background: ${isCurrentPitstop ? '#FEE2E2' : '#E0F2FE'}; color: ${isCurrentPitstop ? '#B91C1C' : '#0369A1'};"
            >
              ${isCurrentPitstop ? "✖ Remove Waypoint" : "+ Add Route Waypoint"}
            </button>
          </div>
        </div>
      `);

      popup.on("open", () => {
        setTimeout(() => {
          const btn = document.getElementById(`btn-pitstop-${poi.id}`);
          if (btn && onTogglePitstop) {
            btn.onclick = () => {
              onTogglePitstop(poi.id);
              popup.remove();
            };
          }
        }, 50);
      });

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

export default React.memo(MapView);
