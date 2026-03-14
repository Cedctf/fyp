import Head from 'next/head';
import DengueHeatmap from '@/components/DengueHeatmap';
import Navbar from '@/components/Navbar';

export default function DengueHeatmapPage() {
    return (
        <div className="min-h-screen bg-white text-black">
            <Head>
                <title>Dengue Risk Heatmap</title>
                <meta name="description" content="Predicted Dengue Hotspots in Kuala Lumpur" />
            </Head>

            <Navbar />

            {/* Page Title Overlay */}
            <div className="absolute top-16 left-0 w-full z-20 pointer-events-none">
                <div className="container mx-auto px-4">
                    <h1 className="text-5xl font-light font-serif text-[rgb(27,55,121)] leading-[1.1] tracking-tight">
                        Dengue Risk Heatmap
                    </h1>
                </div>
            </div>

            <DengueHeatmap />
        </div>
    );
}
