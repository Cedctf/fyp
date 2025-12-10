import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '100vh'
};

const center = {
    lat: 3.1390, // Kuala Lumpur
    lng: 101.6869
};

const LIBRARIES = ['visualization'];

function HeatmapMap({ data }) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES
    });

    const [map, setMap] = useState(null);
    const [heatmap, setHeatmap] = useState(null);

    // UI State for controls
    const [radius, setRadius] = useState(10);
    const [opacity, setOpacity] = useState(0.6);
    const [gradient, setGradient] = useState(null);
    const [visible, setVisible] = useState(true);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    // Initialize Heatmap
    useEffect(() => {
        if (!map || !data || data.length === 0 || !window.google || !window.google.maps.visualization) {
            return;
        }

        console.log(`Initializing Heatmap with ${data.length} points`);
        const points = data.map(point => new window.google.maps.LatLng(point.lat, point.lng));

        const newHeatmap = new window.google.maps.visualization.HeatmapLayer({
            data: points,
            map: map,
            radius: radius,
            opacity: opacity
        });

        setHeatmap(newHeatmap);

        const bounds = new window.google.maps.LatLngBounds();
        points.forEach(p => bounds.extend(p));
        map.fitBounds(bounds);

        return () => {
            if (newHeatmap) newHeatmap.setMap(null);
        };
    }, [map, data]);

    // Handle Option Changes
    useEffect(() => {
        if (heatmap) heatmap.set('radius', radius);
    }, [heatmap, radius]);

    useEffect(() => {
        if (heatmap) heatmap.set('opacity', opacity);
    }, [heatmap, opacity]);

    useEffect(() => {
        if (heatmap) heatmap.set('gradient', gradient);
    }, [heatmap, gradient]);

    useEffect(() => {
        if (heatmap) heatmap.setMap(visible ? map : null);
    }, [heatmap, visible, map]);

    const changeGradient = () => {
        const altGradient = [
            "rgba(0, 255, 255, 0)",
            "rgba(0, 255, 255, 1)",
            "rgba(0, 191, 255, 1)",
            "rgba(0, 127, 255, 1)",
            "rgba(0, 63, 255, 1)",
            "rgba(0, 0, 255, 1)",
            "rgba(0, 0, 223, 1)",
            "rgba(0, 0, 191, 1)",
            "rgba(0, 0, 159, 1)",
            "rgba(0, 0, 127, 1)",
            "rgba(63, 0, 91, 1)",
            "rgba(127, 0, 63, 1)",
            "rgba(191, 0, 31, 1)",
            "rgba(255, 0, 0, 1)"
        ];
        setGradient(current => current ? null : altGradient);
    };

    const changeRadius = () => {
        setRadius(current => current === 10 ? 30 : 10);
    };

    const changeOpacity = () => {
        setOpacity(current => current === 0.6 ? 0.2 : 0.6);
    };

    if (loadError) return <div>Map cannot be loaded: {loadError.message}</div>;
    if (!isLoaded) return <div>Loading Map...</div>;

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <div style={{
                position: 'absolute',
                top: 10,
                left: 200, // Offset to not cover default map controls
                zIndex: 5,
                backgroundColor: 'white',
                padding: 10,
                borderRadius: 5,
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                display: 'flex',
                gap: '10px'
            }}>
                <button onClick={() => setVisible(v => !v)}>Toggle Heatmap</button>
                <button onClick={changeGradient}>Change Gradient</button>
                <button onClick={changeRadius}>Change Radius</button>
                <button onClick={changeOpacity}>Change Opacity</button>
            </div>

            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={12}
                onLoad={onLoad}
                onUnmount={onUnmount}
            />
        </div>
    );
}

export default React.memo(HeatmapMap);
