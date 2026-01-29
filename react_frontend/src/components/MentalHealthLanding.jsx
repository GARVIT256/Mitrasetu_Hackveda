import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';

const MentalHealthLanding = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const scrollY = useRef(0);
  const targetScrollY = useRef(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Smooth scroll state
  const [smoothScroll, setSmoothScroll] = useState(0);

  // 3D Objects refs
  const brainRef = useRef(null);
  const particlesRef = useRef(null);
  const flowFieldRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a0a, 50, 200);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 30);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0xff00ff, 1, 100);
    pointLight1.position.set(-10, -10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00ff00, 0.8, 100);
    pointLight2.position.set(10, -5, -10);
    scene.add(pointLight2);

    // Create Brain-like structure
    const brainGroup = new THREE.Group();
    
    // Main brain sphere
    const brainGeometry = new THREE.SphereGeometry(8, 32, 32);
    const brainMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x4a90e2,
      transparent: true,
      opacity: 0.7,
      wireframe: false
    });
    const brainMesh = new THREE.Mesh(brainGeometry, brainMaterial);
    brainGroup.add(brainMesh);

    // Neural connections
    const connectionsGroup = new THREE.Group();
    for (let i = 0; i < 100; i++) {
      const geometry = new THREE.SphereGeometry(0.1, 8, 8);
      const material = new THREE.MeshBasicMaterial({ 
        color: Math.random() > 0.5 ? 0x00ffff : 0xff00ff,
        transparent: true,
        opacity: 0.8
      });
      const sphere = new THREE.Mesh(geometry, material);
      
      sphere.position.x = (Math.random() - 0.5) * 20;
      sphere.position.y = (Math.random() - 0.5) * 20;
      sphere.position.z = (Math.random() - 0.5) * 20;
      
      connectionsGroup.add(sphere);
    }
    brainGroup.add(connectionsGroup);

    // Wireframe overlay
    const wireframeGeometry = new THREE.SphereGeometry(8.2, 16, 16);
    const wireframeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const wireframeMesh = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    brainGroup.add(wireframeMesh);

    scene.add(brainGroup);
    brainRef.current = brainGroup;

    // Particle system
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      
      colors[i * 3] = Math.random();
      colors[i * 3 + 1] = Math.random() * 0.5 + 0.5;
      colors[i * 3 + 2] = 1;
      
      sizes[i] = Math.random() * 3;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
      size: 2,
      transparent: true,
      opacity: 0.6,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    particlesRef.current = particleSystem;

    // Flow field
    const flowGeometry = new THREE.BufferGeometry();
    const flowPositions = [];
    const flowColors = [];

    for (let i = 0; i < 200; i++) {
      const startPoint = new THREE.Vector3(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60
      );
      
      const endPoint = startPoint.clone().add(new THREE.Vector3(
        Math.sin(i * 0.1) * 10,
        Math.cos(i * 0.1) * 10,
        Math.sin(i * 0.05) * 10
      ));

      flowPositions.push(startPoint.x, startPoint.y, startPoint.z);
      flowPositions.push(endPoint.x, endPoint.y, endPoint.z);
      
      const color = new THREE.Color().setHSL(Math.random() * 0.6 + 0.4, 0.8, 0.6);
      flowColors.push(color.r, color.g, color.b);
      flowColors.push(color.r, color.g, color.b);
    }

    flowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(flowPositions, 3));
    flowGeometry.setAttribute('color', new THREE.Float32BufferAttribute(flowColors, 3));

    const flowMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.4
    });

    const flowLines = new THREE.LineSegments(flowGeometry, flowMaterial);
    scene.add(flowLines);
    flowFieldRef.current = flowLines;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      // Smooth scroll interpolation
      targetScrollY.current = window.pageYOffset;
      scrollY.current += (targetScrollY.current - scrollY.current) * 0.08;

      if (brainRef.current) {
        brainRef.current.rotation.x = time * 0.2 + scrollY.current * 0.001;
        brainRef.current.rotation.y = time * 0.3 + scrollY.current * 0.002;
        brainRef.current.position.y = Math.sin(time * 0.5) * 2 - scrollY.current * 0.01;
        
        // Scale based on scroll
        const scale = 1 + Math.sin(scrollY.current * 0.01) * 0.3;
        brainRef.current.scale.setScalar(scale);
      }

      if (particlesRef.current) {
        particlesRef.current.rotation.y = time * 0.1;
        const positions = particlesRef.current.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += Math.sin(time + i) * 0.01;
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      if (flowFieldRef.current) {
        flowFieldRef.current.rotation.z = time * 0.05;
        flowFieldRef.current.material.opacity = 0.2 + Math.sin(time) * 0.2;
      }

      // Camera movement
      camera.position.x = Math.sin(scrollY.current * 0.002) * 5;
      camera.position.z = 30 + scrollY.current * 0.02;
      camera.lookAt(0, -scrollY.current * 0.01, 0);

      renderer.render(scene, camera);
    };

    animate();
    setIsLoaded(true);

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Smooth scroll handler
    const handleScroll = () => {
      setSmoothScroll(window.pageYOffset);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative">
      {/* 3D Canvas */}
      <div ref={mountRef} className="fixed inset-0 z-0" />
      
      {/* Loading Screen */}
      {!isLoaded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="text-2xl text-white animate-pulse">Loading...</div>
        </div>
      )}

      {/* Content Overlay */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="flex items-center justify-center min-h-screen px-8 text-white">
          <div className="max-w-4xl text-center">
            <h1 className="mb-8 font-bold text-transparent text-7xl bg-gradient-to-r from-cyan-400 via-purple-500 to-green-400 bg-clip-text animate-pulse">
              MindSphere
            </h1>
            <p className="mb-12 text-2xl leading-relaxed opacity-90">
              Revolutionary 3D Mental Health Platform
            </p>
            <div className="space-x-6">
              <button className="px-8 py-4 text-lg font-semibold transition-transform duration-300 rounded-full shadow-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:scale-105 hover:shadow-cyan-500/25">
                Begin Journey
              </button>
              <button className="px-8 py-4 text-lg font-semibold transition-colors duration-300 border-2 rounded-full border-cyan-400 hover:bg-cyan-400 hover:text-black">
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="flex items-center justify-center min-h-screen px-8 text-white bg-gradient-to-b from-transparent via-purple-900/20 to-transparent">
          <div className="grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-3">
            <div className="p-8 text-center transition-all duration-500 border rounded-3xl bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:scale-105">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 text-3xl rounded-full bg-gradient-to-r from-cyan-400 to-blue-600">
                🧠
              </div>
              <h3 className="mb-4 text-2xl font-bold text-cyan-300">Neural Mapping</h3>
              <p className="leading-relaxed text-gray-300">
                Advanced 3D visualization of neural pathways and mental health patterns using cutting-edge neurotechnology.
              </p>
            </div>
            
            <div className="p-8 text-center transition-all duration-500 border rounded-3xl bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:scale-105">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 text-3xl rounded-full bg-gradient-to-r from-purple-400 to-pink-600">
                🌟
              </div>
              <h3 className="mb-4 text-2xl font-bold text-purple-300">Immersive Therapy</h3>
              <p className="leading-relaxed text-gray-300">
                Experience therapeutic environments in stunning 3D spaces designed to promote healing and mindfulness.
              </p>
            </div>
            
            <div className="p-8 text-center transition-all duration-500 border rounded-3xl bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:scale-105">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 text-3xl rounded-full bg-gradient-to-r from-green-400 to-emerald-600">
                📊
              </div>
              <h3 className="mb-4 text-2xl font-bold text-green-300">Real-time Analytics</h3>
              <p className="leading-relaxed text-gray-300">
                Monitor your mental health journey with beautiful 3D data visualizations and personalized insights.
              </p>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="flex items-center justify-center min-h-screen px-8 text-white">
          <div className="max-w-4xl text-center">
            <h2 className="mb-12 text-5xl font-bold text-transparent bg-gradient-to-r from-green-400 via-cyan-500 to-purple-600 bg-clip-text">
              Next-Gen Technology
            </h2>
            <div className="grid grid-cols-1 gap-8 mb-12 md:grid-cols-2">
              <div className="p-6 border rounded-2xl bg-gradient-to-br from-cyan-900/30 to-purple-900/30 border-cyan-500/30">
                <h3 className="mb-3 text-xl font-bold text-cyan-300">AI-Powered Insights</h3>
                <p className="text-gray-300">Machine learning algorithms analyze patterns in your mental health data.</p>
              </div>
              <div className="p-6 border rounded-2xl bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
                <h3 className="mb-3 text-xl font-bold text-purple-300">VR Integration</h3>
                <p className="text-gray-300">Immersive virtual reality experiences for therapy and meditation.</p>
              </div>
              <div className="p-6 border rounded-2xl bg-gradient-to-br from-green-900/30 to-cyan-900/30 border-green-500/30">
                <h3 className="mb-3 text-xl font-bold text-green-300">Biometric Sync</h3>
                <p className="text-gray-300">Connect with wearable devices for comprehensive health monitoring.</p>
              </div>
              <div className="p-6 border rounded-2xl bg-gradient-to-br from-pink-900/30 to-purple-900/30 border-pink-500/30">
                <h3 className="mb-3 text-xl font-bold text-pink-300">Cloud Security</h3>
                <p className="text-gray-300">Enterprise-grade security ensures your data remains private and secure.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="flex items-center justify-center min-h-screen px-8 text-white bg-gradient-to-t from-purple-900/40 to-transparent">
          <div className="max-w-4xl text-center">
            <h2 className="mb-8 text-6xl font-bold text-transparent bg-gradient-to-r from-cyan-400 via-green-400 to-purple-500 bg-clip-text">
              Transform Your Mind
            </h2>
            <p className="mb-12 text-xl leading-relaxed opacity-90">
              Join thousands who have revolutionized their mental health journey with our 3D platform
            </p>
            <div className="space-y-6">
              <button className="px-12 py-6 text-xl font-bold transition-all duration-300 rounded-full shadow-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-green-500 hover:scale-110 hover:shadow-cyan-500/50 animate-pulse">
                Start Free Trial
              </button>
              <div className="flex justify-center space-x-8 text-sm opacity-60">
                <span>✓ No Credit Card Required</span>
                <span>✓ 30-Day Money Back</span>
                <span>✓ HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MentalHealthLanding;