import React from 'react';
import dynamic from 'next/dynamic';

// Dynamic import for KeplerGl as it relies on window/document
// Dynamic import for KeplerGl to handle SSR constraints
const KeplerGl = dynamic(
    () => import('@kepler.gl/components').then((mod) => mod.KeplerGl || mod.default),
    {
        ssr: false,
        loading: () => <p>Loading Map...</p>
    }
);

export default function KeplerMap() {
    return (
        <div style={{ position: 'absolute', width: '100%', height: '100vh', top: 0, left: 0 }}>
            <KeplerGl
                id="dengue-map"
                width={1920} // These will be responsive in a real app, typically handled by AutoSizer
                height={1080}
                mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN}
            />
        </div>
    );
}
