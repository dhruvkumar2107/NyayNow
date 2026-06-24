# nearby.py
# If we had a Google Maps API Key, we would use requests to call the Places API.
# Since the user might only have Gemini, we can simulate "finding" services 
# or use a free OpenStreetMap provider if needed. 
# For "Realtime" without Maps Key, we can't search THE REAL WORLD maps easily.
# BUT, we can use Gemini to "recommend" how to find them or list well known ones if the location is major.

import json

def geocode_location(query):
    # Mock geocode for now, or use free API
    return {"lat": 28.6139, "lon": 77.2090, "name": query}

def nearby_search(query, lat, lon, limit=5):
    # In a real startup, this connects to Google Places API.
    # Here, we generate realistic static data based on the query to ensure the UI works "realtime"
    # effectively acting as a highly sophisticated mock.
    
    return [
        {"name": f"City Civil Court, {query}", "rating": 4.5, "address": "Court Road, Civil Lines", "type": "court"},
        {"name": f"{query} District Court", "rating": 4.2, "address": "District Complex", "type": "court"},
        {"name": "Legal Aid Clinic", "rating": 4.0, "address": "Community Center", "type": "legal_aid"},
        {"name": "Family Court", "rating": 3.8, "address": "Judicial Block", "type": "court"},
        {"name": "Police Station Main", "rating": 3.5, "address": "Main Market", "type": "police"},
    ]
