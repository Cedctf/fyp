import React, { useEffect, useState, useMemo, useRef } from 'react';
import { GoogleMap, LoadScript, HeatmapLayer, Rectangle } from '@react-google-maps/api';
import Papa from 'papaparse';

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
    const [heatmapData, setHeatmapData] = useState([]); // Predicted (JSON)
    const [historicalData, setHistoricalData] = useState([]); // Historical (CSV)
    const [dataSource, setDataSource] = useState('predicted'); // 'predicted' | 'historical'
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

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // 1. Fetch BOTH datasets on mount
    useEffect(() => {
        // Fetch Predicted Data (JSON)
        fetch('/heatmap_data.json')
            .then(res => res.json())
            .then(data => {
                setHeatmapData(data);
            })
            .catch(err => console.error("Error loading predicted data:", err));

        // Fetch Historical Data (CSV)
        fetch('/ultimate_combined_data.csv')
            .then(res => res.text())
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
                                    dateObj: dateObj
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

    // 2. Transform data keys using useMemo for performance
    const currentPoints = useMemo(() => {
        if (!mapLoaded) return [];

        let targetData = [];

        if (dataSource === 'predicted') {
            targetData = heatmapData;
        } else {
            // Apply Filters for Historical Data
            targetData = historicalData.filter(point => {
                // 1. Filter by Time Range (7/14/28 days)
                if (['7days', '14days', '28days'].includes(historicalTimeFilter)) {
                    if (!point.dateObj || !maxDate) return false;
                    const days = parseInt(historicalTimeFilter.replace('days', ''));
                    const diffTime = Math.abs(maxDate - point.dateObj);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays >= 0 && diffDays <= days;
                }

                // 2. Filter by Year/Month
                if (historicalTimeFilter === 'year_month') {
                    const yearMatch = selectedYear === 'All' || point.year === parseInt(selectedYear);
                    const monthMatch = selectedMonth === 'All' || point.monthIndex === months.indexOf(selectedMonth);
                    return yearMatch && monthMatch;
                }

                // 3. All Time
                if (historicalTimeFilter === 'all') return true;

                return false;
            });
        }

        return targetData.map(point => ({
            location: new window.google.maps.LatLng(point.lat, point.lng),
            weight: point.weight || 1
        }));
    }, [mapLoaded, dataSource, heatmapData, historicalData, selectedYear, selectedMonth, historicalTimeFilter, maxDate]);

    const currentOptions = useMemo(() => {
        return {
            dissipating: false,
            radius: dataSource === 'predicted' ? 0.006 : 0.006,
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
        };
    }, [dataSource]);

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
                <div className="absolute top-24 left-4 z-10 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-gray-200 w-80">
                    <div className="flex items-center space-x-2 mb-4">
                        <span className="text-2xl">🦟</span>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Dengue Copilot</h1>
                    </div>

                    {/* Data Source Toggle */}
                    <div className="mb-4">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                            Data Source
                        </label>
                        <div className="flex bg-gray-200 p-1 rounded-lg">
                            <button
                                onClick={() => setDataSource('predicted')}
                                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${dataSource === 'predicted'
                                    ? 'bg-white text-gray-800 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Predicted
                            </button>
                            <button
                                onClick={() => setDataSource('historical')}
                                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${dataSource === 'historical'
                                    ? 'bg-white text-orange-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Historical
                            </button>
                        </div>
                    </div>

                    {/* Risk Intensity Legend (New) */}
                    <div className="mb-4">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                            Risk Intensity
                        </label>
                        <div className="h-3 w-full rounded-md bg-gradient-to-r from-green-400 via-yellow-400 to-red-600 shadow-inner"></div>
                        <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-medium">
                            <span>Low</span>
                            <span>Medium</span>
                            <span>High</span>
                        </div>
                    </div>

                    {/* Conditional Filters */}
                    {dataSource === 'historical' && (
                        <div className="mb-4 space-y-3 bg-orange-50 p-3 rounded-lg border border-orange-100">
                            {/* Filter Mode Selection */}
                            <div>
                                <label className="text-xs font-semibold text-orange-800 mb-1 block">
                                    Display Range
                                </label>
                                <select
                                    value={historicalTimeFilter}
                                    onChange={(e) => setHistoricalTimeFilter(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-orange-200 rounded-md text-sm text-gray-700 outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="year_month">By Year & Month</option>
                                    <option value="7days">Last 7 Days (Latest)</option>
                                    <option value="14days">Last 14 Days (Latest)</option>
                                    <option value="28days">Last 28 Days (Latest)</option>
                                    <option value="all">All Time</option>
                                </select>
                            </div>

                            {/* Year/Month Dropdowns (Only if 'year_month' is selected) */}
                            {historicalTimeFilter === 'year_month' && (
                                <div className="grid grid-cols-2 gap-2 animate-in fade-in zoom-in duration-300">
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="All">All Years</option>
                                        {availableYears.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="All">All Months</option>
                                        {months.map(month => (
                                            <option key={month} value={month}>{month}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="text-center">
                                <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                                    {currentPoints.length} cases found
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Report Generation Section */}
                    <div className="pt-4 border-t border-gray-200">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                            Weekly Report (PDF)
                        </label>

                        {/* Trend Range for PDF (Report Only) */}
                        <div className="mb-2">
                            <select
                                value={trendRange}
                                onChange={(e) => setTrendRange(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-600 outline-none"
                            >
                                <option value="0">Trend: Same as Report (2025)</option>
                                <option value="7">Trend: Last 7 Days</option>
                                <option value="14">Trend: Last 14 Days</option>
                                <option value="28">Trend: Last 28 Days</option>
                            </select>
                        </div>

                        <button
                            onClick={() => {
                                // Hardcoded to Week 52 as requested to match dataset end
                                const week = 52;
                                const btn = document.getElementById('gen-btn');
                                if (btn) btn.innerText = "Generating...";

                                fetch(`/api/report/generate?week=${week}&days=${trendRange}`)
                                    .then(res => res.json())
                                    .then(data => {
                                        if (data.url) {
                                            window.open(data.url, '_blank');
                                        } else {
                                            alert("Error generating report");
                                        }
                                    })
                                    .catch(err => {
                                        console.error(err);
                                        alert("Failed to generate report");
                                    })
                                    .finally(() => {
                                        if (btn) btn.innerText = "Generate PDF Report";
                                    });
                            }}
                            id="gen-btn"
                            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-4 rounded-lg transition-colors shadow-lg shadow-blue-500/30"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Generate PDF Report</span>
                        </button>
                    </div>
                </div>
            </GoogleMap>
        </LoadScript>
    );
};

export default DengueHeatmap;
