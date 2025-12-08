import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addDataToMap } from '@kepler.gl/actions';
import { Processors } from '@kepler.gl/processors';
import KeplerMap from '../components/KeplerMap';

export default function DengueDashboard() {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/ultimate_combined_data.csv');
                const csvData = await response.text();

                const data = Processors.processCsvData(csvData);

                // Define the config to automatically map Latitude/Longitude
                // Kepler often detects this automatically, but being explicit helps
                const config = {
                    version: 'v1',
                    config: {
                        visState: {
                            layers: [
                                {
                                    id: 'dengue-cases',
                                    type: 'point',
                                    config: {
                                        dataId: 'dengue_data',
                                        label: 'Dengue Cases',
                                        columns: {
                                            lat: 'Latitude',
                                            lng: 'Longitude',
                                            altitude: null
                                        },
                                        isVisible: true,
                                        visConfig: {
                                            radius: 10,
                                            fixedRadius: false,
                                            opacity: 0.8,
                                            outline: false,
                                            thickness: 2,
                                            strokeColor: null,
                                            colorRange: {
                                                name: 'Global Warming',
                                                type: 'sequential',
                                                category: 'Uber',
                                                colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300']
                                            },
                                            radiusRange: [0, 50],
                                            'hi-precision': false
                                        }
                                    }
                                }
                            ]
                        }
                    }
                };

                dispatch(
                    addDataToMap({
                        datasets: {
                            info: {
                                label: 'Dengue Cases',
                                id: 'dengue_data'
                            },
                            data
                        },
                        option: {
                            centerMap: true,
                            readOnly: false
                        },
                        config
                    })
                );
            } catch (error) {
                console.error('Error fetching or processing data:', error);
            }
        };

        fetchData();
    }, [dispatch]);

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <KeplerMap />
        </div>
    );
}
