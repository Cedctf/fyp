import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, HeatmapLayer, Rectangle } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '100vh'
};

const center = {
    lat: 3.14,
    lng: 101.69
};

const scanBounds = {
    north: 3.25,
    south: 3.03,
    east: 101.78,
    west: 101.60
};

const libraries = ['visualization'];

const DengueHeatmap = () => {
    const [heatmapData, setHeatmapData] = useState([]);
    const [mapLoaded, setMapLoaded] = useState(false);

    // 1. Fetch raw data first
    useEffect(() => {
        fetch('/heatmap_data.json')
            .then(res => res.json())
            .then(data => {
                setHeatmapData(data); // Store raw data
            })
            .catch(err => console.error("Error loading heatmap data:", err));
    }, []);

    // 2. Transform data ONLY when map is loaded and data exists
    const getPoints = () => {
        if (!mapLoaded || heatmapData.length === 0) return [];

        return heatmapData.map(point => ({
            location: new window.google.maps.LatLng(point.lat, point.lng),
            weight: point.weight
        }));
    };

    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-center p-8 bg-red-900/50 rounded-xl border border-red-500">
                    <h2 className="text-2xl font-bold mb-4">Missing API Key</h2>
                    <p>Please add <code className="bg-black px-2 py-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your .env.local file.</p>
                </div>
            </div>
        );
    }

    return (
        <LoadScript
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
            libraries={libraries}
            onLoad={() => setMapLoaded(true)}
        >
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={12}
                onLoad={() => setMapLoaded(true)} // Ensure we know when map is ready
                options={{
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                }}
            >
                {mapLoaded && heatmapData.length > 0 && (
                    <HeatmapLayer
                        data={getPoints()}
                        options={{
                            dissipating: false, // Scale with map, not pixels
                            radius: 0.006, // Radius in degrees (approx 600m)
                            opacity: 0.6,
                            gradient: [
                                'rgba(0, 255, 0, 0)',
                                'rgba(0, 255, 0, 1)',   // Green
                                'rgba(147, 255, 0, 1)',
                                'rgba(193, 255, 0, 1)',
                                'rgba(238, 255, 0, 1)', // Yellow-Green
                                'rgba(244, 227, 0, 1)', // Yellow
                                'rgba(249, 198, 0, 1)',
                                'rgba(255, 170, 0, 1)', // Orange
                                'rgba(255, 113, 0, 1)',
                                'rgba(255, 57, 0, 1)',
                                'rgba(255, 0, 0, 1)'    // Red
                            ]
                        }}
                    />
                )}

                {/* Visualizing the Scan Grid Area */}
                <Rectangle
                    bounds={scanBounds}
                    options={{
                        strokeColor: "#000000",
                        strokeOpacity: 0.3,
                        strokeWeight: 2,
                        fillColor: "#000000",
                        fillOpacity: 0.02,
                        clickable: false
                    }}
                />
            </GoogleMap>
        </LoadScript>
    );
};

export default DengueHeatmap;
