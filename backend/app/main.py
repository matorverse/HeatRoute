"""
HeatRoute Backend Service
FastAPI REST application + AWS Lambda Mangum entry point.
"""

from fastapi import FastAPI, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from datetime import datetime, timezone

from .models import RouteRequest, RouteResponse
from .route_optimizer import optimize_routes, load_corridor_data, load_hydration_pois
from .solar_engine import calculate_solar_position

app = FastAPI(
    title="HeatRoute Engine API",
    description="Safety-constrained, thermal-aware routing and recovery layer built for AWS Lambda.",
    version="1.0.0"
)

# Enable CORS for local development and AWS S3/CloudFront hosted frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root(response: Response):
    response.headers["Cache-Control"] = "public, max-age=3600"
    return {
        "service": "HeatRoute Engine API",
        "status": "OPERATIONAL",
        "cloud_provider": "AWS",
        "runtime": "AWS Lambda + Python 3.11",
        "region": "ap-south-1 (Mumbai)",
        "track": "Track 02: Heat & Water"
    }


@app.get("/api/v1/corridors")
@app.get("/v1/corridors")
def get_corridors(response: Response):
    """Returns available microclimate testbed corridors with 10-minute caching."""
    response.headers["Cache-Control"] = "public, max-age=600"
    raw = load_corridor_data()
    raw_all = raw.get("corridors", [])
    if not raw_all:
        raw_all = [{
            "corridor_id": raw.get("corridor_id", "DELHI_CP_TO_MANDI_HOUSE"),
            "name": raw.get("name", "Rajiv Chowk (Connaught Place) to Mandi House Metro Hub"),
            "city": raw.get("city", "New Delhi"),
            "origin": raw.get("origin", {}),
            "destination": raw.get("destination", {})
        }]
    
    corridors = []
    for c in raw_all:
        corridors.append({
            "id": c["corridor_id"],
            "name": c["name"],
            "city": c.get("city", "New Delhi"),
            "origin": c.get("origin", {}),
            "destination": c.get("destination", {}),
            "default_zoom": c.get("default_zoom", 14.5)
        })
    return {"corridors": corridors}


@app.post("/api/v1/routes/evaluate", response_model=RouteResponse)
@app.post("/v1/routes/evaluate", response_model=RouteResponse)
def evaluate_routes(request: RouteRequest):
    """
    Evaluates pedestrian routes through safety filters, solar geometry,
    relative thermal exposure, and detour limits.
    """
    departure = request.departure_time or datetime.now(timezone.utc).isoformat()
    result = optimize_routes(
        origin=request.origin,
        destination=request.destination,
        departure_time_iso=departure,
        ambient_temp_c=request.ambient_temp_c or 42.0,
        humidity_pct=request.relative_humidity or 45.0,
        max_detour_percent=request.max_detour_percent or 25.0,
        mode_preference=request.mode_preference or "BALANCED",
        season=request.season or "SUMMER",
        corridor_id=request.corridor_id or "DELHI_CP_TO_MANDI_HOUSE",
        pitstop_poi_id=request.pitstop_poi_id
    )
    return result


@app.get("/api/v1/hydration-pois")
@app.get("/v1/hydration-pois")
def get_hydration_pois(response: Response):
    """Returns verified hydration kiosks, water ATMs, and cooling spots with 10-minute caching."""
    response.headers["Cache-Control"] = "public, max-age=600"
    pois = load_hydration_pois()
    return {
        "count": len(pois),
        "pois": pois
    }


@app.get("/api/v1/solar-position")
@app.get("/v1/solar-position")
def get_solar_position(
    lat: float = Query(28.6328, description="Latitude"),
    lon: float = Query(77.2195, description="Longitude"),
    time_iso: str = Query("2026-06-15T13:30:00+05:30", description="ISO time string")
):
    """Calculate solar azimuth and altitude for given coordinates and timestamp."""
    try:
        dt = datetime.fromisoformat(time_iso)
    except Exception:
        dt = datetime.now(timezone.utc)
    
    pos = calculate_solar_position(lat, lon, dt)
    return {
        "latitude": lat,
        "longitude": lon,
        "query_time": time_iso,
        "solar_position": pos
    }


# AWS Lambda Entrypoint
handler = Mangum(app)
