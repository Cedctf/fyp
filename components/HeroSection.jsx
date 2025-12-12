import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

// --- 1. CONFIGURATION (MODIFIED) ---
const PANO_URL = "/world_pano.png";
const CAMERA_FOV = 75;
// Adjusted rotation to recenter the view for the new Z position
const rotationAngle = 1.4;

// --- 2. PANO COMPONENT (MODIFIED to accept rotationAngle as a prop for flexibility) ---
const PanoBackground = ({ url, rotationAngle, onLoad }) => {
    const texture = useTexture(url);
    texture.colorSpace = THREE.SRGBColorSpace;

    useEffect(() => {
        if (texture && onLoad) {
            onLoad();
        }
    }, [texture, onLoad]);

    return (
        <mesh rotation={[0, rotationAngle, 0]}>
            <sphereGeometry args={[500, 60, 40]} />
            <meshBasicMaterial
                map={texture}
                side={THREE.BackSide}
                toneMapped={false}
            />
        </mesh>
    );
};

// --- 3. CAMERA RIG COMPONENT (UNCHANGED) ---
const GlobalCameraRig = () => {
    const mouse = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (event) => {
            mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useFrame((state) => {
        const targetY = mouse.current.x * -0.2;
        const targetX = mouse.current.y * -0.1;

        state.camera.rotation.y = THREE.MathUtils.lerp(state.camera.rotation.y, targetY, 0.05);
        state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, targetX, 0.05);
    });

    return null;
};

// --- 4. THE MAIN SCENE (MODIFIED POSITION & STYLING) ---
/**
 * The main component rendering the Canvas and all 3D objects.
 */
const HeroSection = ({ onSceneReady }) => {
    const [isReady, setIsReady] = useState(false);
    const newCameraPosition = [100, 0, -200.0];

    const handleSceneLoad = () => {
        setIsReady(true);
        if (onSceneReady) {
            onSceneReady();
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh', backgroundColor: 'black' }}>
            <Canvas>
                <PerspectiveCamera
                    makeDefault
                    position={newCameraPosition}
                    fov={CAMERA_FOV}
                />

                <Suspense fallback={null}>
                    <PanoBackground url={PANO_URL} rotationAngle={rotationAngle} onLoad={handleSceneLoad} />
                    <GlobalCameraRig />
                </Suspense>
            </Canvas>
        </div>
    );
};

export default HeroSection;