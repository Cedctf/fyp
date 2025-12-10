import Head from 'next/head';
import DengueHeatmap from '@/components/DengueHeatmap';
import Link from 'next/link';

export default function DengueHeatmapPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            <Head>
                <title>Dengue Risk Heatmap | ETERNAI</title>
                <meta name="description" content="Predicted Dengue Hotspots in Kuala Lumpur" />
            </Head>

            {/* Header Overlay */}
            <div className="absolute top-0 left-0 w-full z-10 p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <div className="max-w-7xl mx-auto flex justify-between items-center pointer-events-auto">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
                            Dengue Risk Heatmap
                        </h1>
                        <p className="text-gray-300 text-sm mt-1">
                            AI-Predicted Hotspots for Next Week
                        </p>
                    </div>
                    <Link href="/" className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-sm transition-all border border-white/10">
                        Back to Home
                    </Link>
                </div>
            </div>

            {/* Legend Overlay */}
            <div className="absolute bottom-8 right-8 z-10 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 max-w-xs">
                <h3 className="text-sm font-semibold mb-2 text-gray-200">Risk Intensity</h3>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <div className="w-4 h-4 rounded bg-blue-500"></div>
                    <span>Low Risk</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <div className="w-4 h-4 rounded bg-purple-500"></div>
                    <span>Medium Risk</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-4 h-4 rounded bg-red-500"></div>
                    <span>High Risk</span>
                </div>
            </div>

            <DengueHeatmap />
        </div>
    );
}
