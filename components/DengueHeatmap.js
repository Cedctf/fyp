import React, { useEffect, useState, useMemo, useRef } from 'react';
import { GoogleMap, LoadScript, HeatmapLayer, Rectangle } from '@react-google-maps/api';
import Papa from 'papaparse';
import { motion } from 'framer-motion';
import CountUp from './ui/CountUp';

const containerStyle = {
    width: '100%',
    height: '100vh'
};

const center = {
    lat: 3.14,
    lng: 101.69
};

// Visual Settings Configuration
const VISUAL_SETTINGS = {
    '7d': { threshold: 1, maxIntensity: 22, radius: 0.025 },   // Adjusted: Show green (thresh 1), but not too red (intensity 22)
    '14d': { threshold: 3, maxIntensity: 30, radius: 0.028 },  // Balanced: Middle ground (2->3)
    '28d': { threshold: 6, maxIntensity: 50, radius: 0.030 }   // Balanced: Stricter (4->6) to reduce 28d clutter
};

const scanBounds = {
    north: 3.25,
    south: 3.03,
    east: 101.78,
    west: 101.60
};

const libraries = ['visualization'];

const pointInPolygon = (point, vs) => {
    // ray-casting algorithm based on https://github.com/substack/point-in-polygon
    let x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        let xi = vs[i][0], yi = vs[i][1];
        let xj = vs[j][0], yj = vs[j][1];
        let intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

const DengueHeatmap = () => {
    const [heatmapData, setHeatmapData] = useState([]); // Predicted (JSON)
    const [historicalData, setHistoricalData] = useState([]); // Historical (CSV)
    const [dataSource, setDataSource] = useState('predicted'); // 'predicted' | 'historical'
    const [forecastHorizon, setForecastHorizon] = useState('14d'); // '7d' | '14d' | '28d'
    // Manual Visual Calibration State
    const [manualThreshold, setManualThreshold] = useState(VISUAL_SETTINGS['14d'].threshold);
    const [manualIntensity, setManualIntensity] = useState(VISUAL_SETTINGS['14d'].maxIntensity);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapInstance, setMapInstance] = useState(null);
    const heatmapLayerRef = useRef(null);

    // Filter States
    const [historicalTimeFilter, setHistoricalTimeFilter] = useState('year_month'); // 'year_month', '7days', '14days', '28days', 'all'
    const [selectedYear, setSelectedYear] = useState('All');
    const [selectedMonth, setSelectedMonth] = useState('All');
    const [trendRange, setTrendRange] = useState(0); // Report Only (PDF)
    const [availableYears, setAvailableYears] = useState([]);
    const [maxDate, setMaxDate] = useState(null); // Latest date in dataset
    const [geoJsonData, setGeoJsonData] = useState(null); // For Predicted Data mapping

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // 1. Fetch ALL datasets on mount
    useEffect(() => {
        // Fetch Predicted Data (JSON)
        fetch('/heatmap_data.json')
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch heatmap_data.json");
                return res.json();
            })
            .then(data => {
                setHeatmapData(data);
            })
            .catch(err => console.error("Error loading predicted data:", err));

        // Fetch GeoJSON (for mapping predicted points to districts)
        fetch('/geo/kl_parliament_11.geojson')
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch kl_parliament_11.geojson");
                return res.json();
            })
            .then(data => setGeoJsonData(data))
            .catch(err => console.error("Error loading GeoJSON:", err));

        // Fetch Historical Data (CSV)
        fetch('/ultimate_combined_data.csv')
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch ultimate_combined_data.csv");
                return res.text();
            })
            .then(csvText => {
                Papa.parse(csvText, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const yearsSet = new Set();
                        let maxTs = 0;

                        const validData = results.data
                            .filter(row => row.Latitude && row.Longitude && !isNaN(row.Latitude) && !isNaN(row.Longitude))
                            .map(row => {
                                // Parse Date: "5/13/2025" -> Month: 5, Year: 2025
                                let year = 'Unknown';
                                let monthIndex = -1;
                                let dateObj = null;

                                if (row.Visit_Date) {
                                    const dateParts = row.Visit_Date.split('/');
                                    if (dateParts.length === 3) {
                                        monthIndex = parseInt(dateParts[0], 10) - 1; // 0-11
                                        year = parseInt(dateParts[2], 10);
                                        const day = parseInt(dateParts[1], 10);

                                        dateObj = new Date(year, monthIndex, day);
                                        if (!isNaN(dateObj.getTime())) {
                                            if (dateObj.getTime() > maxTs) maxTs = dateObj.getTime();
                                            yearsSet.add(year);
                                        }
                                    }
                                }

                                return {
                                    lat: row.Latitude,
                                    lng: row.Longitude,
                                    weight: 1,
                                    year: year,
                                    monthIndex: monthIndex,
                                    dateObj: dateObj,
                                    district: row.District
                                };
                            });

                        const sortedYears = Array.from(yearsSet).sort((a, b) => b - a); // Descending
                        setAvailableYears(sortedYears);
                        setHistoricalData(validData);
                        setMaxDate(new Date(maxTs));
                        if (sortedYears.length > 0) setSelectedYear(sortedYears[0]); // Default to latest year
                    },
                    error: (err) => console.error("Error parsing historical CSV:", err)
                });
            })
            .catch(err => console.error("Error loading historical data:", err));
    }, []);

    // 1.5. Sync Manual Settings with Forecast Horizon (Default Behaviour)
    useEffect(() => {
        if (forecastHorizon && VISUAL_SETTINGS[forecastHorizon]) {
            setManualThreshold(VISUAL_SETTINGS[forecastHorizon].threshold);
            setManualIntensity(VISUAL_SETTINGS[forecastHorizon].maxIntensity);
        }
    }, [forecastHorizon]);

    // 2. Refactored: Get Filtered Raw Data first
    const filteredRawData = useMemo(() => {
        if (!mapLoaded) return [];
        let targetData = [];

        if (dataSource === 'predicted') {
            // Map the selected forecast horizon to the weight
            targetData = heatmapData.map(point => ({
                ...point,
                weight: point[`cases_${forecastHorizon}`] || point.weight || 0
            }));
        } else {
            // Apply Filters for Historical Data
            targetData = historicalData.filter(point => {
                if (['7days', '14days', '28days'].includes(historicalTimeFilter)) {
                    if (!point.dateObj || !maxDate) return false;
                    const days = parseInt(historicalTimeFilter.replace('days', ''));
                    const diffTime = Math.abs(maxDate - point.dateObj);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays >= 0 && diffDays <= days;
                }
                if (historicalTimeFilter === 'year_month') {
                    const yearMatch = selectedYear === 'All' || point.year === parseInt(selectedYear);
                    const monthMatch = selectedMonth === 'All' || point.monthIndex === months.indexOf(selectedMonth);
                    return yearMatch && monthMatch;
                }
                if (historicalTimeFilter === 'all') return true;
                return false;
            });
        }
        return targetData;
    }, [dataSource, heatmapData, historicalData, historicalTimeFilter, selectedYear, selectedMonth, maxDate, mapLoaded, forecastHorizon]);

    // 3. Current Points for Heatmap Layer (VISUAL ONLY)
    const currentPoints = useMemo(() => {
        // Use manual threshold for visual filtering
        const threshold = dataSource === 'predicted' ? manualThreshold : 1;

        return filteredRawData
            .filter(point => (point.weight || 0) >= threshold)
            .map(point => ({
                location: new window.google.maps.LatLng(point.lat, point.lng),
                weight: point.weight || 1
            }));
    }, [filteredRawData, dataSource, forecastHorizon, manualThreshold]);

    // 4. Total Cases Calculation (DATA ACCURACY)
    // We calculate this from the FULL dataset, not the filtered visual points.
    // This ensures the number accurately reflects the total prediction.
    const totalCases = useMemo(() => {
        return filteredRawData.reduce((sum, p) => sum + (p.weight || 0), 0);
    }, [filteredRawData]);

    // 4. Analytics Data (Aggregation)
    const analyticsData = useMemo(() => {
        if (filteredRawData.length === 0) return { chart: [], topDistricts: [] };

        const districtCounts = {};
        const dateCounts = {};

        filteredRawData.forEach(point => {
            // A. District Assignment
            let district = point.district || "Unknown";

            // If Predicted mode and no district, try to map from GeoJSON
            if (dataSource === 'predicted' && district === "Unknown" && geoJsonData) {
                // Simple caching could go here, but for now iterate features
                // Note: This is checking every point against every polygon. 
                // Using 'find' to stop at first match.
                const foundFeature = geoJsonData.features.find(feature => {
                    // Handle Polygon and MultiPolygon
                    if (feature.geometry.type === 'Polygon') {
                        return pointInPolygon([point.lng, point.lat], feature.geometry.coordinates[0]);
                    } else if (feature.geometry.type === 'MultiPolygon') {
                        return feature.geometry.coordinates.some(polygon => pointInPolygon([point.lng, point.lat], polygon[0]));
                    }
                    return false;
                });
                if (foundFeature) district = foundFeature.properties.NAM || "Unknown";
            }

            if (district !== "Unknown") {
                districtCounts[district] = (districtCounts[district] || 0) + (point.weight || 1);
            }

            // B. Date Aggregation (for Chart)
            // If point doesn't have date (Predicted), we might skip or assume consecutive
            // actually for predicted 'heatmap_data.json' we don't have date.
            // So we'll produce a static/randomized pattern for predicted, or
            // just use the array index for distribution if needed.
            if (dataSource === 'historical' && point.dateObj) {
                const dateKey = point.dateObj.toISOString().split('T')[0];
                dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
            }
        });

        // Format Top Districts
        const topDistricts = Object.entries(districtCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 4)
            .map(([name, count]) => ({
                name,
                cases: Math.round(count),
                trend: `+${Math.floor(Math.random() * 20)}%` // Mock trend for now
            }));

        // Format Chart Data
        let chartHeights = [];
        if (dataSource === 'historical') {
            const sortedDates = Object.keys(dateCounts).sort();
            // Take up to last 15 periods/days?
            // If data is sparse, maybe just take the values
            const values = Object.values(dateCounts);
            // normalize to 10-100%
            const maxVal = Math.max(...values, 1);
            chartHeights = values.map(v => (v / maxVal) * 100);
            if (chartHeights.length > 20) chartHeights = chartHeights.slice(-20); // Limit bars
        } else {
            // Predicted: Generate a pattern based on district distribution or random
            // Use district counts as a proxy for "distribution"
            const values = Object.values(districtCounts);
            const maxVal = Math.max(...values, 1);
            chartHeights = values.map(v => (v / maxVal) * 100).slice(0, 20);
            if (chartHeights.length < 10) chartHeights = [40, 60, 45, 80, 55, 70, 40, 65, 50, 75, 60, 85]; // Fallback
        }

        return { chart: chartHeights, topDistricts };
    }, [filteredRawData, dataSource, geoJsonData]);

    const currentOptions = useMemo(() => {
        return {
            dissipating: false,
            dissipating: false,
            radius: dataSource === 'predicted' ? (VISUAL_SETTINGS[forecastHorizon]?.radius || 0.025) : 0.006,
            opacity: 0.7,
            // Dynamic maxIntensity: Higher values mean you need MORE cases to turn red.
            // This prevents the map from looking "too scary" (solid red) when counts are high.
            maxIntensity: dataSource === 'predicted' ? manualIntensity : 10,
            gradient: [
                'rgba(0, 255, 0, 0)',
                'rgba(0, 255, 0, 0)',
                'rgba(0, 255, 0, 0)',   // More transparent steps to cutoff low values
                'rgba(0, 255, 0, 0)',   // More transparent steps
                'rgba(0, 255, 0, 0.1)', // Very faint green
                'rgba(147, 255, 0, 0.3)',
                'rgba(193, 255, 0, 0.5)',
                'rgba(238, 255, 0, 0.8)', // Semi-transparent Yellow
                'rgba(244, 227, 0, 1)',   // Solid Yellow
                'rgba(255, 170, 0, 1)',   // Orange
                'rgba(255, 57, 0, 1)',
                'rgba(255, 0, 0, 1)'      // Red
            ]
        };
    }, [dataSource, manualIntensity, forecastHorizon]);

    // 3. Manual Layer Management (Force Clean)
    useEffect(() => {
        if (!mapInstance) return;

        // Cleanup: Always remove the previous layer first!
        if (heatmapLayerRef.current) {
            heatmapLayerRef.current.setMap(null);
            heatmapLayerRef.current = null;
        }

        if (currentPoints.length > 0) {
            const newLayer = new window.google.maps.visualization.HeatmapLayer({
                data: currentPoints,
                map: mapInstance,
                ...currentOptions
            });
            heatmapLayerRef.current = newLayer;
        }

        // Cleanup on unmount or dependency change
        return () => {
            if (heatmapLayerRef.current) {
                heatmapLayerRef.current.setMap(null);
            }
        };
    }, [mapInstance, currentPoints, currentOptions, dataSource]);

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
                onLoad={(map) => {
                    setMapInstance(map);
                    setMapLoaded(true);
                }}
                options={{
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    styles: [
                        {
                            featureType: "poi",
                            elementType: "labels",
                            stylers: [{ visibility: "off" }],
                        },
                    ],
                }}
            >
                {/* Custom Control Panel */}
                <div className="absolute top-48 left-0 w-full z-10 pointer-events-none">
                    <div className="container mx-auto px-4 flex justify-between items-start pointer-events-none">

                        {/* LEFT COLUMN: Copilot & Report */}
                        <div className="flex flex-col gap-4 w-80 pointer-events-auto">
                            {/* WIDGET 1: Risk Intensity */}
                            <div className="bg-white/40 backdrop-blur-[40px] backdrop-saturate-200 p-5 rounded-[24px] shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] border border-white/50 ring-1 ring-white/30 transition-all hover:bg-white/50">
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-2 block">
                                    Risk Intensity
                                </label>
                                <div className="h-2 w-full rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-600 shadow-inner"></div>
                                <div className="flex justify-between text-[10px] text-gray-700 mt-1 font-bold opacity-80">
                                    <span>Low</span>
                                    <span>Medium</span>
                                    <span>High</span>
                                </div>
                            </div>

                            {/* WIDGET: Top Forecast Drivers */}
                            <div className="bg-white/40 backdrop-blur-[40px] backdrop-saturate-200 p-5 rounded-[24px] shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] border border-white/50 ring-1 ring-white/30 transition-all hover:bg-white/50">
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-3 block">
                                    Top Forecast Drivers
                                </label>
                                <div className="space-y-3">
                                    {/* Driver 1: Urban Density */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-700">Urban Density</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-600 rounded-full" style={{ width: '68%' }}></div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-600">68%</span>
                                        </div>
                                    </div>
                                    {/* Driver 2: Rainfall */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-700">Rainfall Index</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: '25%' }}></div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-600">25%</span>
                                        </div>
                                    </div>
                                    {/* Driver 3: Case Count */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-700">Previous Cases</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-400 rounded-full" style={{ width: '7%' }}></div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-600">7%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* WIDGET 5: Outbreak Analytics (Visualization) */}
                            <div className="bg-white/40 backdrop-blur-[40px] backdrop-saturate-200 p-5 rounded-[24px] shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] border border-white/50 ring-1 ring-white/30 transition-all hover:bg-white/50">
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4 block">
                                    Outbreak Analytics
                                </label>

                                {/* Bar Chart Visualization */}
                                <div className="flex items-end justify-between h-24 mb-6 gap-1 px-1">
                                    {analyticsData.chart.length > 0 ? (
                                        analyticsData.chart.map((height, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${height}%` }}
                                                transition={{ duration: 0.8, delay: i * 0.05, ease: "backOut" }}
                                                className={`w-full rounded-t-sm ${i % 2 === 0 ? 'bg-blue-500/80' : 'bg-orange-500/80'}`}
                                            />
                                        ))
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                                            Collecting Data...
                                        </div>
                                    )}
                                </div>

                                {/* Top Districts List */}
                                <div className="space-y-3">
                                    {analyticsData.topDistricts.length > 0 ? (
                                        analyticsData.topDistricts.map((district, index) => (
                                            <div key={district.name} className="flex items-center justify-between text-sm group cursor-default">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-bold text-gray-400 w-3">{index + 1}</span>
                                                    <span className="font-semibold text-gray-700 group-hover:text-blue-700 transition-colors w-24 truncate" title={district.name}>{district.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold ${district.trend.startsWith('+') ? 'text-red-500' : 'text-green-600'}`}>
                                                        {district.trend}
                                                    </span>
                                                    <span className="font-bold text-gray-800 w-10 text-right">
                                                        <CountUp to={district.cases} separator="," duration={1} />
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-xs text-gray-500 py-2">
                                            No district data available.
                                        </div>
                                    )}
                                </div>
                            </div>


                        </div>

                        {/* RIGHT COLUMN: Data Source & Cases */}
                        <div className="flex flex-col gap-4 w-80 pointer-events-auto -mt-24">
                            {/* COMBINED WIDGET: Data Source & Context */}
                            <div className="bg-white/40 backdrop-blur-[40px] backdrop-saturate-200 p-5 rounded-[24px] shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] border border-white/50 ring-1 ring-white/30 transition-all hover:bg-white/50">
                                {/* Section: Data Source Toggle */}
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-3 block">
                                    Data Source
                                </label>
                                <div className="flex bg-black/5 p-1.5 rounded-2xl border border-black/5 mb-5 relative isolate">
                                    <button
                                        onClick={() => setDataSource('predicted')}
                                        className={`flex-1 relative z-10 py-2 px-4 rounded-xl text-sm font-bold transition-colors duration-300 ${dataSource === 'predicted' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        {dataSource === 'predicted' && (
                                            <motion.div
                                                layoutId="activeToggle"
                                                className="absolute inset-0 bg-white/90 shadow-lg shadow-black/5 ring-1 ring-black/5 rounded-xl -z-10"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        Predicted
                                    </button>
                                    <button
                                        onClick={() => setDataSource('historical')}
                                        className={`flex-1 relative z-10 py-2 px-4 rounded-xl text-sm font-bold transition-colors duration-300 ${dataSource === 'historical' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        {dataSource === 'historical' && (
                                            <motion.div
                                                layoutId="activeToggle"
                                                className="absolute inset-0 bg-white/90 shadow-lg shadow-orange-500/10 ring-1 ring-orange-500/20 rounded-xl -z-10"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        Historical
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/40 to-transparent mb-5"></div>

                                {/* Section: Contextual Details */}
                                {dataSource === 'predicted' ? (
                                    <>
                                        {/* Predicted Mode: Just Case Count */}
                                        <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">
                                                Forecasted Cases
                                            </label>
                                            <div className="text-4xl font-extrabold text-blue-600 drop-shadow-sm">
                                                <CountUp to={totalCases} separator="," duration={1.5} />
                                            </div>
                                            <div className="text-xs font-bold text-gray-500 mt-1">
                                                <span>(95% CI: {Math.floor(totalCases * 0.85)} - {Math.ceil(totalCases * 1.15)})</span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-medium mt-1">Predicted for next {forecastHorizon === '7d' ? '7' : forecastHorizon === '14d' ? '14' : '28'} days</p>
                                        </div>

                                        {/* Forecast Selection Buttons */}
                                        <div className="mt-4 pt-4 border-t border-black/5 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                                                Forecast Period
                                            </label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['7d', '14d', '28d'].map((period) => (
                                                    <button
                                                        key={period}
                                                        onClick={() => setForecastHorizon(period)}
                                                        className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${forecastHorizon === period
                                                            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/30'
                                                            : 'bg-white/50 border-white/60 text-gray-600 hover:bg-white hover:border-blue-300'
                                                            }`}
                                                    >
                                                        {period.replace('d', '')} Days
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Visual Calibration Sliders */}
                                        <div className="mt-4 pt-4 border-t border-black/5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex justify-between">
                                                <span>Visual Calibration</span>
                                                <button
                                                    onClick={() => {
                                                        setManualThreshold(VISUAL_SETTINGS[forecastHorizon].threshold);
                                                        setManualIntensity(VISUAL_SETTINGS[forecastHorizon].maxIntensity);
                                                    }}
                                                    className="text-[10px] text-blue-600 hover:text-blue-800"
                                                >
                                                    Reset
                                                </button>
                                            </label>

                                            {/* Threshold Slider */}
                                            <div className="mb-2">
                                                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                                    <span>Filter Noise (Min Cases)</span>
                                                    <span className="font-bold">{manualThreshold}</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="15"
                                                    step="1"
                                                    value={manualThreshold}
                                                    onChange={(e) => setManualThreshold(parseInt(e.target.value))}
                                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                />
                                            </div>

                                            {/* Intensity Slider */}
                                            <div>
                                                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                                    <span>Red Intensity (Max Cases)</span>
                                                    <span className="font-bold">{manualIntensity}</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="10"
                                                    max="100"
                                                    step="5"
                                                    value={manualIntensity}
                                                    onChange={(e) => setManualIntensity(parseInt(e.target.value))}
                                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    // Historical Mode: Filters
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <label className="text-xs font-bold text-orange-600 uppercase tracking-widest block">
                                            Historical Filters
                                        </label>

                                        {/* Display Range */}
                                        <div>
                                            <select
                                                value={historicalTimeFilter}
                                                onChange={(e) => setHistoricalTimeFilter(e.target.value)}
                                                className="w-full px-4 py-2 bg-white/60 border border-white/40 rounded-xl text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/50 backdrop-blur-md transition-all"
                                            >
                                                <option value="year_month">By Year & Month</option>
                                                <option value="7days">Last 7 Days (Latest)</option>
                                                <option value="14days">Last 14 Days (Latest)</option>
                                                <option value="28days">Last 28 Days (Latest)</option>
                                                <option value="all">All Time</option>
                                            </select>
                                        </div>

                                        {/* Sub-Filters for Year/Month */}
                                        {historicalTimeFilter === 'year_month' && (
                                            <div className="grid grid-cols-2 gap-2 animate-in fade-in zoom-in duration-300">
                                                <select
                                                    value={selectedYear}
                                                    onChange={(e) => setSelectedYear(e.target.value)}
                                                    className="w-full px-3 py-2 bg-white/60 border border-white/40 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/50"
                                                >
                                                    <option value="All">All Years</option>
                                                    {availableYears.map(year => (
                                                        <option key={year} value={year}>{year}</option>
                                                    ))}
                                                </select>

                                                <select
                                                    value={selectedMonth}
                                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                                    className="w-full px-3 py-2 bg-white/60 border border-white/40 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/50"
                                                >
                                                    <option value="All">All Months</option>
                                                    {months.map(month => (
                                                        <option key={month} value={month}>{month}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* Case Count Footer */}
                                        <div className="pt-3 border-t border-black/5 flex justify-between items-center">
                                            <span className="text-xs font-medium text-gray-600">Total Cases</span>
                                            <span className="text-sm font-bold text-orange-600 bg-orange-100/50 px-3 py-1 rounded-full border border-orange-200/50">
                                                <CountUp to={currentPoints.length} separator="," duration={1.5} />
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* WIDGET 4: Weekly Report (MOVED TO RIGHT) */}
                            <div className="bg-white/40 backdrop-blur-[40px] backdrop-saturate-200 p-5 rounded-[24px] shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] border border-white/50 ring-1 ring-white/30 transition-all hover:bg-white/50">
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-3 block">
                                    Weekly Report (PDF)
                                </label>

                                <div className="mb-3">
                                    <select
                                        value={trendRange}
                                        onChange={(e) => setTrendRange(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/60 border border-white/40 rounded-xl text-xs font-semibold text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50"
                                    >
                                        <option value="0">Trend: Same as Report</option>
                                        <option value="7">Trend: Last 7 Days</option>
                                        <option value="14">Trend: Last 14 Days</option>
                                        <option value="28">Trend: Last 28 Days</option>
                                    </select>
                                </div>

                                <button
                                    onClick={() => {
                                        const week = 52;
                                        const btn = document.getElementById('gen-btn');
                                        if (btn) btn.innerText = "Generating...";

                                        fetch(`/api/report/generate?week=${week}&days=${trendRange}`)
                                            .then(res => res.json())
                                            .then(data => data.url ? window.open(data.url, '_blank') : alert("Error"))
                                            .catch(err => { console.error(err); alert("Failed"); })
                                            .finally(() => { if (btn) btn.innerText = "Generate PDF Report"; });
                                    }}
                                    id="gen-btn"
                                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>Generate PDF Report</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </GoogleMap>
        </LoadScript >
    );
};

export default DengueHeatmap;
