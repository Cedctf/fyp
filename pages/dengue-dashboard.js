import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addDataToMap, wrapTo } from '@kepler.gl/actions';
import { Processors } from '@kepler.gl/processors';
import KeplerMap from '../components/KeplerMap';

export default function DengueDashboard() {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('Fetching CSV data...');
                const response = await fetch('/ultimate_combined_data.csv');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const csvData = await response.text();
                console.log('CSV Data fetched, length:', csvData.length);

                const data = Processors.processCsvData(csvData);
                console.log('Processed Data:', data);

                const config = {
                    version: 'v1',
                    config: {
                        mapStyle: {
                            styleType: 'light'
                        },
                        visState: {
                            layers: [
                                {
                                    id: 'dengue-cluster',
                                    type: 'cluster',
                                    config: {
                                        dataId: 'dengue_data',
                                        label: 'Dengue Clusters',
                                        columns: {
                                            lat: 'Latitude',
                                            lng: 'Longitude'
                                        },
                                        isVisible: true,
                                        visConfig: {
                                            opacity: 0.8,
                                            clusterRadius: 20,
                                            radiusRange: [0, 20], // Min/max pixel radius for clusters
                                            colorRange: {
                                                name: 'Global Warming',
                                                type: 'sequential',
                                                category: 'Uber',
                                                colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300']
                                            }
                                        }
                                    }
                                },
                                {
                                    id: 'dengue-points',
                                    type: 'point',
                                    config: {
                                        dataId: 'dengue_data',
                                        label: 'Individual Cases',
                                        columns: {
                                            lat: 'Latitude',
                                            lng: 'Longitude',
                                            altitude: null
                                        },
                                        isVisible: false,
                                        visConfig: {
                                            radius: 10,
                                            fixedRadius: false,
                                            opacity: 0.8,
                                            colorRange: {
                                                name: 'Global Warming',
                                                type: 'sequential',
                                                category: 'Uber',
                                                colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300']
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                };

                console.log('Dispatching addDataToMap with config:', config);

                // Short delay to ensure KeplerGl component is mounted and state is initialized
                await new Promise(resolve => setTimeout(resolve, 1000));

                try {
                    console.log('Dispatching action now...');
                    dispatch(
                        wrapTo(
                            'dengue-map',
                            addDataToMap({
                                datasets: [
                                    {
                                        info: {
                                            label: 'Dengue Cases',
                                            id: 'dengue_data'
                                        },
                                        data
                                    }
                                ],
                                options: {
                                    centerMap: true,
                                    readOnly: false
                                },
                                config
                            })
                        )
                    );
                    console.log('Dispatch successful!');
                } catch (dispatchError) {
                    console.error('Error during dispatch:', dispatchError);
                }
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
