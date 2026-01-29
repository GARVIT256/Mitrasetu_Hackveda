import React, { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import Lenis from '@studio-freight/lenis'
import Navigation from '../components/Navigation'
import Hero from '../components/Hero'
import About from '../components/About'
import Services from '../components/Services'
import Contact from '../components/Contact'


// 3D Torus Knot that animates with scroll
function AnimatedTorusKnot({ scrollY }) {
  const mesh = useRef()
  useFrame(() => {
    if (mesh.current) {
      // Animate rotation and scale based on scrollY
      mesh.current.rotation.x = scrollY / 500
      mesh.current.rotation.y = scrollY / 300
      mesh.current.scale.set(1 + scrollY / 2000, 1 + scrollY / 2000, 1 + scrollY / 2000)
    }
  })
  return (
    <mesh ref={mesh} position={[0, 0, 0]}>
      <torusKnotGeometry args={[1.2, 0.4, 128, 32]} />
      <meshPhysicalMaterial color="#7f5fff" roughness={0.2} metalness={0.8} clearcoat={1} clearcoatRoughness={0.1} />
    </mesh>
  )
}

// 3D Canvas Background
function ThreeBackground({ scrollY }) {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 60 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <AnimatedTorusKnot scrollY={scrollY} />
      <Environment preset="sunset" />
      {/* Optionally add controls for dev: <OrbitControls /> */}
    </Canvas>
  )
}

export default function Landing() {
  const [scrollY, setScrollY] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const lenisRef = useRef(null)

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      smooth: true,
      lerp: 0.1,
      direction: 'vertical',
    })
    lenisRef.current = lenis
    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    // Smooth scroll for anchor links
    const handleAnchorClick = (e) => {
      const href = e.target.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const el = document.querySelector(href);
        if (el) {
          lenis.scrollTo(el, { offset: -20, duration: 1.2, easing: (t) => 1 - Math.pow(1 - t, 3) });
        }
      }
    };
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', handleAnchorClick);
    });

    // Listen to scroll
    function onScroll() {
      setScrollY(window.scrollY)
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(docHeight > 0 ? window.scrollY / docHeight : 0)
    }
    window.addEventListener('scroll', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.removeEventListener('click', handleAnchorClick);
      });
      lenis.destroy()
    }
  }, [])

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* Superconscious-style Background */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 25%, #16213e 50%, #0f3460 75%, #0a0a0a 100%)',
        }}
        aria-hidden="true"
      >
        {/* Floating orbs similar to Superconscious */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          transform: `translateY(${scrollY * 0.1}px)`,
          animation: 'float 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(30px)',
          transform: `translateY(${scrollY * 0.15}px)`,
          animation: 'float 8s ease-in-out infinite reverse'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '30%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(25px)',
          transform: `translateY(${scrollY * 0.2}px)`,
          animation: 'float 10s ease-in-out infinite'
        }} />
      </div>
      {/* Scroll Progress Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${scrollProgress * 100}%`,
        height: '4px',
        background: 'linear-gradient(90deg, #7f5fff 0%, #5fffd7 100%)',
        zIndex: 100,
        transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1)'
      }} />
      <ThreeBackground scrollY={scrollY} />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Navigation />
        <Hero />
        <About scrollY={scrollY} />
        <Services scrollY={scrollY} />
        <Contact scrollY={scrollY} />
      </div>
    </div>
  )
}
