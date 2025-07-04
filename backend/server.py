from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import uuid
from datetime import datetime, timedelta
import httpx
import json
import numpy as np
from skyfield.api import load, wgs84
from skyfield.data import hipparcos
import requests
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import math
from PIL import Image
import io
import base64
import google.generativeai as genai

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini AI
genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))

# Database setup
client = AsyncIOMotorClient(os.environ.get('MONGO_URL'))
db = client.orbita

app = FastAPI(title="Project ORBITA - Satellite Intelligence Platform")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for satellite data
satellites = None
ts = None

# Initialize satellite data on startup
@app.on_event("startup")
async def startup_event():
    global satellites, ts
    try:
        # Load satellite data from NORAD
        stations_url = 'https://celestrak.com/NORAD/elements/stations.txt'
        satellites = load.tle_file(stations_url)
        ts = load.timescale()
        print(f"Loaded {len(satellites)} satellites from NORAD")
    except Exception as e:
        print(f"Error loading satellite data: {e}")
        satellites = {}
        ts = load.timescale()

# Pydantic models
class SatellitePosition(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    altitude: float
    velocity: float
    timestamp: datetime

class LocationRequest(BaseModel):
    latitude: float
    longitude: float

class SatellitePassRequest(BaseModel):
    satellite_name: str
    latitude: float
    longitude: float
    days: int = 7

class ImageAnalysisRequest(BaseModel):
    location: str
    analysis_type: str
    date_range: List[str]

class AIAnalysisRequest(BaseModel):
    image_data: str
    analysis_type: str
    prompt: Optional[str] = None

# Satellite tracking endpoints
@app.get("/api/satellites/list")
async def list_satellites():
    """Get list of available satellites"""
    if not satellites:
        return {"satellites": [], "message": "Satellite data not loaded"}
    
    satellite_list = []
    for sat in satellites[:50]:  # Limit to first 50 for performance
        satellite_list.append({
            "id": str(hash(sat.name)),
            "name": sat.name,
            "catalog_number": sat.model.satnum if hasattr(sat.model, 'satnum') else 'Unknown'
        })
    
    return {"satellites": satellite_list}

@app.get("/api/satellites/{satellite_id}/position")
async def get_satellite_position(satellite_id: str):
    """Get current position of a satellite"""
    if not satellites or not ts:
        raise HTTPException(status_code=503, detail="Satellite data not available")
    
    try:
        # Find satellite by ID
        satellite = None
        for sat in satellites:
            if str(hash(sat.name)) == satellite_id:
                satellite = sat
                break
        
        if not satellite:
            raise HTTPException(status_code=404, detail="Satellite not found")
        
        # Get current position
        t = ts.now()
        geocentric = satellite.at(t)
        subpoint = wgs84.subpoint(geocentric)
        
        # Calculate velocity
        t_plus = ts.now() + timedelta(minutes=1)
        geocentric_plus = satellite.at(t_plus)
        subpoint_plus = wgs84.subpoint(geocentric_plus)
        
        # Approximate velocity calculation
        velocity = geocentric.velocity.km_per_s
        speed = math.sqrt(sum([v**2 for v in velocity]))
        
        return {
            "id": satellite_id,
            "name": satellite.name,
            "latitude": subpoint.latitude.degrees,
            "longitude": subpoint.longitude.degrees,
            "altitude": subpoint.elevation.km,
            "velocity": speed,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating position: {str(e)}")

@app.post("/api/satellites/passes")
async def get_satellite_passes(request: SatellitePassRequest):
    """Get satellite passes for a location"""
    if not satellites or not ts:
        raise HTTPException(status_code=503, detail="Satellite data not available")
    
    try:
        # Find satellite
        satellite = None
        for sat in satellites:
            if sat.name.lower() == request.satellite_name.lower():
                satellite = sat
                break
        
        if not satellite:
            raise HTTPException(status_code=404, detail="Satellite not found")
        
        # Create observer location
        observer = wgs84.latlon(request.latitude, request.longitude)
        
        # Calculate passes for the next few days
        t0 = ts.now()
        
        passes = []
        # Simplified pass calculation - check every 2 hours
        for i in range(request.days * 12):  # Check every 2 hours
            t = t0 + timedelta(hours=i*2)
            geocentric = satellite.at(t)
            difference = geocentric - observer
            topocentric = difference.at(t)
            
            alt, az, distance = topocentric.altaz()
            
            if alt.degrees > 10:  # Satellite is above horizon
                passes.append({
                    "time": t.utc_iso(),
                    "altitude": alt.degrees,
                    "azimuth": az.degrees,
                    "distance": distance.km
                })
        
        return {"passes": passes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating passes: {str(e)}")

# Earth observation endpoints
@app.get("/api/earth-observation/imagery")
async def get_satellite_imagery(location: str, date: str = None, image_type: str = "natural"):
    """Get satellite imagery for a location"""
    try:
        # This would integrate with Sentinel Hub API
        # For now, returning mock data structure
        sentinel_api_key = os.environ.get('SENTINEL_API_KEY')
        
        print(f"Sentinel API Key: {sentinel_api_key}")  # Debug print
        
        if not sentinel_api_key:
            raise HTTPException(status_code=503, detail="Sentinel Hub API key not configured")
        
        # Mock response structure for now
        return {
            "location": location,
            "date": date or datetime.now().isoformat(),
            "image_type": image_type,
            "image_url": f"https://services.sentinel-hub.com/ogc/wms/{sentinel_api_key}",
            "metadata": {
                "resolution": "10m",
                "cloud_coverage": "5%",
                "satellite": "Sentinel-2"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching imagery: {str(e)}")

@app.post("/api/earth-observation/ndvi")
async def calculate_ndvi(request: ImageAnalysisRequest):
    """Calculate NDVI for agricultural monitoring"""
    try:
        # Mock NDVI calculation
        ndvi_data = {
            "location": request.location,
            "date_range": request.date_range,
            "ndvi_values": [0.7, 0.8, 0.6, 0.9, 0.75],  # Mock values
            "analysis": "Vegetation health is good with slight variations in the southern region",
            "recommendations": [
                "Monitor southern region for potential stress",
                "Irrigation may be needed in areas with NDVI < 0.65"
            ]
        }
        
        return ndvi_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating NDVI: {str(e)}")

@app.post("/api/ai/analyze-image")
async def analyze_image_with_ai(request: AIAnalysisRequest):
    """Analyze satellite imagery using Gemini AI"""
    try:
        # Configure Gemini model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Decode base64 image
        image_data = base64.b64decode(request.image_data)
        image = Image.open(io.BytesIO(image_data))
        
        # Create analysis prompt based on type
        if request.analysis_type == "deforestation":
            prompt = "Analyze this satellite image for signs of deforestation. Identify cleared areas, logging patterns, and estimate the extent of forest loss. Provide specific observations about the environmental impact."
        elif request.analysis_type == "agriculture":
            prompt = "Analyze this satellite image for agricultural monitoring. Identify crop types, health status, irrigation patterns, and any signs of stress or disease. Provide recommendations for farm management."
        elif request.analysis_type == "security":
            prompt = "Analyze this satellite image for security monitoring. Look for unusual activities, infrastructure changes, vehicle movements, or other anomalies that might indicate security concerns."
        else:
            prompt = request.prompt or "Analyze this satellite image and provide detailed observations."
        
        # Generate analysis
        response = model.generate_content([prompt, image])
        
        return {
            "analysis_type": request.analysis_type,
            "ai_analysis": response.text,
            "confidence": 0.85,  # Mock confidence score
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing image: {str(e)}")

@app.post("/api/ai/detect-changes")
async def detect_changes(before_image: str, after_image: str):
    """Detect changes between two satellite images"""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Decode images
        before_data = base64.b64decode(before_image)
        after_data = base64.b64decode(after_image)
        
        before_img = Image.open(io.BytesIO(before_data))
        after_img = Image.open(io.BytesIO(after_data))
        
        prompt = """Compare these two satellite images taken at different times. 
        Identify and describe any changes between them including:
        - Land use changes
        - Infrastructure development
        - Environmental changes
        - Deforestation or reforestation
        - Agricultural activities
        - Water level changes
        Provide specific details about the changes and their potential significance."""
        
        response = model.generate_content([prompt, before_img, after_img])
        
        return {
            "change_detection": response.text,
            "severity": "moderate",  # Mock severity
            "change_type": "environmental",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error detecting changes: {str(e)}")

# Monitoring and alerts endpoints
@app.get("/api/monitoring/alerts")
async def get_active_alerts():
    """Get active monitoring alerts"""
    try:
        # Mock alerts data
        alerts = [
            {
                "id": str(uuid.uuid4()),
                "type": "deforestation",
                "location": "Amazon Basin",
                "severity": "high",
                "message": "Significant forest loss detected in protected area",
                "timestamp": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "type": "agriculture",
                "location": "Central Valley",
                "severity": "medium",
                "message": "Crop stress detected in sector 7",
                "timestamp": (datetime.now() - timedelta(hours=2)).isoformat()
            }
        ]
        
        return {"alerts": alerts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching alerts: {str(e)}")

@app.get("/api/analytics/dashboard")
async def get_dashboard_data():
    """Get dashboard analytics data"""
    try:
        # Mock dashboard data
        dashboard_data = {
            "total_satellites_tracked": len(satellites) if satellites else 0,
            "active_monitoring_zones": 15,
            "recent_alerts": 3,
            "imagery_processed_today": 47,
            "ai_analyses_completed": 23,
            "deforestation_alerts": 2,
            "agricultural_zones_monitored": 12,
            "security_zones_active": 8
        }
        
        return dashboard_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard data: {str(e)}")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "satellites_loaded": len(satellites) if satellites else 0,
        "apis_configured": {
            "google_earth_engine": bool(os.environ.get('GOOGLE_EARTH_ENGINE_KEY')),
            "sentinel_hub": bool(os.environ.get('SENTINEL_API_KEY')),
            "gemini_ai": bool(os.environ.get('GEMINI_API_KEY')),
            "nasa_earthdata": bool(os.environ.get('NASA_USERNAME'))
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)