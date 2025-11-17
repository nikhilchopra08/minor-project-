'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

interface Textures {
  [key: string]: THREE.Texture;
}

const FBXViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 1, 2);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();

    // Load all textures
    const textures: Textures = {
      cloth1: textureLoader.load('/textures/cloth 1.jpg', () => console.log('Cloth 1 loaded')),
      cloth2: textureLoader.load('/textures/cloth 2.png', () => console.log('Cloth 2 loaded')),
      clothN: textureLoader.load('/textures/cloth n.jpg', () => console.log('Cloth N loaded')),
      concrete: textureLoader.load('/textures/concrete.jpg', () => console.log('Concrete loaded')),
      marble: textureLoader.load('/textures/marble.jpg', () => console.log('Marble loaded')),
      wood: textureLoader.load('/textures/wood.jpg', () => console.log('Wood loaded')),
    };

    // Set texture wrapping and repeat for each texture
    Object.values(textures).forEach((texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(2, 2); // Adjust repeat values as needed
    });

    // Track loading progress
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (_url: string, itemsLoaded: number, itemsTotal: number) => {
      const progress = Math.floor((itemsLoaded / itemsTotal) * 100);
      setLoadingProgress(progress);
    };

    // FBX Loader
    const loader = new FBXLoader(loadingManager);
    loader.load(
      '/solar.fbx', // Update this to the correct path
      (fbx) => {
        fbx.scale.set(0.1, 0.1, 0.1); // Adjust the scale if needed
        fbx.position.set(0, 0, 0);

        // Traverse the model and apply textures
        fbx.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;

            // Log mesh and material names for debugging
            console.log('Mesh Name:', mesh.name);
            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach((mat, index) => {
                  console.log(`Material ${index} Name:`, mat.name);
                });
              } else {
                console.log('Material Name:', mesh.material.name);
              }
            }

            // Determine which texture to apply based on material or mesh name
            const materialName = mesh.name.toLowerCase(); // Use mesh name or material name
            let textureToApply = textures.concrete; // Default texture

            if (materialName.includes('cloth1')) {
              textureToApply = textures.cloth1;
            } else if (materialName.includes('cloth2')) {
              textureToApply = textures.cloth2;
            } else if (materialName.includes('clothn')) {
              textureToApply = textures.clothN;
            } else if (materialName.includes('marble')) {
              textureToApply = textures.marble;
            } else if (materialName.includes('wood')) {
              textureToApply = textures.wood;
            }

            // Apply texture to the material(s)
            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                // Handle multiple materials
                mesh.material.forEach((mat) => {
                  if (mat instanceof THREE.MeshStandardMaterial) {
                    mat.map = textureToApply;
                    mat.needsUpdate = true;
                  } else {
                    console.warn('Material is not MeshStandardMaterial:', mat);
                  }
                });
              } else if (mesh.material instanceof THREE.MeshStandardMaterial) {
                // Handle single material
                mesh.material.map = textureToApply;
                mesh.material.needsUpdate = true;
              } else {
                console.warn('Material is not MeshStandardMaterial:', mesh.material);
              }
            }
          }
        });

        scene.add(fbx);
        setLoading(false);
      },
      undefined,
      (err) => {
        console.error('Error loading FBX:', err);
        setError('Failed to load the FBX file. Please check the file path.');
        setLoading(false);
      }
    );

    // Resize handler
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(clientWidth, clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative flex justify-center items-center  bg-gray-900">
      <div ref={containerRef} className="relative w-[80vw] h-[70vh] border border-gray-700" />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-70 p-6 rounded-lg text-white text-center">
            <h2 className="text-xl mb-3">Loading FBX Model</h2>
            <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300" 
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="mt-2">{loadingProgress}%</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-red-900 bg-opacity-90 p-6 rounded-lg text-white text-center max-w-md">
            <h2 className="text-xl mb-3">Error</h2>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 p-3 rounded text-white text-sm">
        <p>Controls: Left Click + Drag to rotate | Right Click + Drag to pan | Scroll to zoom</p>
      </div>
    </div>
  );
};

export default FBXViewer;