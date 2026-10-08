"""
Solar Geometry & Shadow Engine for HeatRoute
Calculates solar elevation (altitude) and azimuth for any given geographic coordinate
and timestamp, plus shadow factors along street corridors.
Zero external C-dependencies for 100% portable AWS Lambda execution.
"""

import math
from datetime import datetime, timezone


def calculate_solar_position(lat: float, lon: float, dt: datetime) -> dict:
    """
    Calculate solar altitude and azimuth angles in degrees for a given lat/lon and datetime.
    Uses standard NOAA solar position algorithm.
    """
    # Ensure UTC datetime
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        dt = dt.astimezone(timezone.utc)

    # Day of year and fractional hour
    day_of_year = dt.timetuple().tm_yday
    hour_utc = dt.hour + dt.minute / 60.0 + dt.second / 3600.0

    # Fractional year in radians (gamma)
    gamma = 2 * math.pi / 365.0 * (day_of_year - 1 + (hour_utc - 12) / 24.0)

    # Equation of time in minutes
    eqtime = 229.18 * (
        0.000075
        + 0.001868 * math.cos(gamma)
        - 0.032077 * math.sin(gamma)
        - 0.014615 * math.cos(2 * gamma)
        - 0.040849 * math.sin(2 * gamma)
    )

    # Solar declination angle in radians
    decl = (
        0.006918
        - 0.399912 * math.cos(gamma)
        + 0.070257 * math.sin(gamma)
        - 0.006758 * math.cos(2 * gamma)
        + 0.000907 * math.sin(2 * gamma)
        - 0.002697 * math.cos(3 * gamma)
        + 0.00148 * math.sin(3 * gamma)
    )

    # True solar time in minutes
    time_offset = eqtime + 4 * lon
    tst = (hour_utc * 60 + time_offset) % 1440

    # Solar hour angle in degrees
    ha = (tst / 4) - 180
    ha_rad = math.radians(ha)

    lat_rad = math.radians(lat)

    # Solar zenith angle
    cos_zenith = (
        math.sin(lat_rad) * math.sin(decl)
        + math.cos(lat_rad) * math.cos(decl) * math.cos(ha_rad)
    )
    cos_zenith = max(-1.0, min(1.0, cos_zenith))
    zenith_rad = math.acos(cos_zenith)
    altitude_deg = 90.0 - math.degrees(zenith_rad)

    # Solar azimuth angle (degrees clockwise from North)
    sin_zenith = math.sin(zenith_rad)
    if sin_zenith == 0:
        azimuth_deg = 180.0
    else:
        cos_azimuth = (
            (math.sin(lat_rad) * math.cos(zenith_rad) - math.sin(decl))
            / (math.cos(lat_rad) * sin_zenith)
        )
        cos_azimuth = max(-1.0, min(1.0, cos_azimuth))
        azimuth_rad = math.acos(cos_azimuth)
        azimuth_deg = math.degrees(azimuth_rad)
        if ha > 0:
            azimuth_deg = (360.0 - azimuth_deg) % 360.0
        else:
            azimuth_deg = azimuth_deg % 360.0

    return {
        "altitude_deg": max(0.0, altitude_deg),
        "azimuth_deg": azimuth_deg,
        "is_daylight": altitude_deg > 0.0
    }


def calculate_segment_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate compass bearing (0-360 deg) from point 1 to point 2.
    """
    lat1_r = math.radians(lat1)
    lat2_r = math.radians(lat2)
    dlon_r = math.radians(lon2 - lon1)

    y = math.sin(dlon_r) * math.cos(lat2_r)
    x = (
        math.cos(lat1_r) * math.sin(lat2_r)
        - math.sin(lat1_r) * math.cos(lat2_r) * math.cos(dlon_r)
    )
    bearing_rad = math.atan2(y, x)
    bearing_deg = (math.degrees(bearing_rad) + 360.0) % 360.0
    return bearing_deg


def estimate_segment_shade(
    bearing_deg: float,
    building_height_m: float,
    street_width_m: float,
    canopy_coverage: float,  # 0.0 to 1.0 (from trees)
    is_colonnade: bool,      # 100% covered walkway (e.g. Connaught Place arcades)
    solar_altitude_deg: float,
    solar_azimuth_deg: float
) -> dict:
    """
    Estimates the effective pedestrian shade factor (0.0 to 1.0) along a street segment.
    Considers structural colonnades, tree canopy, and building canyon shadow geometry.
    """
    if is_colonnade:
        return {
            "effective_shade": 0.98,
            "shade_source": "colonnade_arcade",
            "confidence": "HIGH"
        }

    if solar_altitude_deg <= 0.0:
        return {
            "effective_shade": 1.0,
            "shade_source": "nighttime",
            "confidence": "HIGH"
        }

    # Relative angle between street axis and solar azimuth
    rel_angle = abs(bearing_deg - solar_azimuth_deg) % 180.0
    sin_rel = math.sin(math.radians(rel_angle))

    # Building shadow calculation
    # When sun is perpendicular to the street (sin_rel near 1.0), tall buildings cast max shade on footpaths.
    canyon_aspect_ratio = building_height_m / max(5.0, street_width_m)
    solar_alt_rad = math.radians(max(5.0, solar_altitude_deg))
    
    # Shadow length relative to street width
    shadow_fraction = (canyon_aspect_ratio / math.tan(solar_alt_rad)) * sin_rel
    building_shade = min(0.85, max(0.0, shadow_fraction * 0.5))

    # Combine building shadow and tree canopy
    # P(shade) = 1 - (1 - P(building)) * (1 - P(canopy))
    combined_shade = 1.0 - (1.0 - building_shade) * (1.0 - canopy_coverage)
    effective_shade = round(min(0.95, max(0.05, combined_shade)), 2)

    confidence = "HIGH" if (building_height_m > 0 and canopy_coverage > 0) else "MODERATE"

    return {
        "effective_shade": effective_shade,
        "building_shade": round(building_shade, 2),
        "canopy_shade": round(canopy_coverage, 2),
        "shade_source": "canopy_and_canyon" if canopy_coverage > 0.3 else "urban_geometry",
        "confidence": confidence
    }
