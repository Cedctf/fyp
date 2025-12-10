import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import HeatmapMap from '../components/HeatmapMap';
import Papa from 'papaparse';

export default function GoogleHeatmapPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/ultimate_combined_data.csv');
                const text = await response.text();

                Papa.parse(text, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const validData = results.data
                            .filter(row => {
                                return row.Latitude && row.Longitude &&
                                    !isNaN(row.Latitude) && !isNaN(row.Longitude);
                            })
                            .map(row => ({
                                lat: row.Latitude,
                                lng: row.Longitude
                            }));

                        console.log(`Parsed ${validData.length} valid rows from CSV`);
                        setData(validData);
                        setLoading(false);
                    },
                    error: (error) => {
                        console.error('CSV Parse Error:', error);
                        setLoading(false);
                    }
                });

            } catch (error) {
                console.error('Error loading CSV:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <Head>
                <title>Dengue Heatmap (Google Maps)</title>
            </Head>
            {loading ? (
                <div style={{ padding: 20 }}>Loading Data...</div>
            ) : (
                <HeatmapMap data={data} />
            )}
        </div>
    );
}
