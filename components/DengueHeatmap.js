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
                    styles: [ // Dark Mode Map Style
                        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                        {
                            featureType: "administrative.locality",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#d59563" }],
                        },
                        {
                            featureType: "poi",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#d59563" }],
                        },
                        {
                            featureType: "poi.park",
                            elementType: "geometry",
                            stylers: [{ color: "#263c3f" }],
                        },
                        {
                            featureType: "poi.park",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#6b9a76" }],
                        },
                        {
                            featureType: "road",
                            elementType: "geometry",
                            stylers: [{ color: "#38414e" }],
                        },
                        {
                            featureType: "road",
                            elementType: "geometry.stroke",
                            stylers: [{ color: "#212a37" }],
                        },
                        {
                            featureType: "road",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#9ca5b3" }],
                        },
                        {
                            featureType: "road.highway",
                            elementType: "geometry",
                            stylers: [{ color: "#746855" }],
                        },
                        {
                            featureType: "road.highway",
                            elementType: "geometry.stroke",
                            stylers: [{ color: "#1f2835" }],
                        },
                        {
                            featureType: "road.highway",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#f3d19c" }],
                        },
                        {
                            featureType: "transit",
                            elementType: "geometry",
                            stylers: [{ color: "#2f3948" }],
                        },
                        {
                            featureType: "transit.station",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#d59563" }],
                        },
                        {
                            featureType: "water",
                            elementType: "geometry",
                            stylers: [{ color: "#17263c" }],
                        },
                        {
                            featureType: "water",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#515c6d" }],
                        },
                        {
                            featureType: "water",
                            elementType: "labels.text.stroke",
                            stylers: [{ color: "#17263c" }],
                        },
                    ],
                }}
            >
                {mapLoaded && heatmapData.length > 0 && (
                    <HeatmapLayer
                        data={getPoints()}
                        options={{
                            dissipating: false, // Scale with map, not pixels
                            radius: 0.006, // Radius in degrees (approx 600m)
                            opacity: 0.8,
                            gradient: [
                                'rgba(0, 255, 255, 0)',
                                'rgba(0, 255, 255, 1)',
                                'rgba(0, 191, 255, 1)',
                                'rgba(0, 127, 255, 1)',
                                'rgba(0, 63, 255, 1)',
                                'rgba(0, 0, 255, 1)',
                                'rgba(0, 0, 223, 1)',
                                'rgba(0, 0, 191, 1)',
                                'rgba(0, 0, 159, 1)',
                                'rgba(0, 0, 127, 1)',
                                'rgba(63, 0, 91, 1)',
                                'rgba(127, 0, 63, 1)',
                                'rgba(191, 0, 31, 1)',
                                'rgba(255, 0, 0, 1)'
                            ]
                        }}
                    />
                )}

                {/* Visualizing the Scan Grid Area */}
                <Rectangle
                    bounds={scanBounds}
                    options={{
                        strokeColor: "#ffffff",
                        strokeOpacity: 0.5,
                        strokeWeight: 2,
                        fillColor: "#ffffff",
                        fillOpacity: 0.05,
                        clickable: false
                    }}
                />
            </GoogleMap>
        </LoadScript>
    );
};

export default DengueHeatmap;
