import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Text, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import ParticleField from './ParticleField';
import FloatingShapes from './FloatingShapes';
import {useNavigate} from 'react-router-dom'

const Hero = () => {
  const navigate = useNavigate()
  
  return (
    <section id="home" className="relative flex items-center justify-center min-h-screen overflow-hidden">
      {/* Content Overlay */}
      <div className="relative z-10 px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="space-y-12"
        >
          {/* Superconscious-style Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-purple-300 border rounded-full border-purple-500/30 bg-purple-500/10 backdrop-blur-sm"
          >
            <Star size={16} className="mr-2" />
            Start Manifesting Today
          </motion.div>

          {/* Main Heading - Superconscious Style */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-6xl font-bold leading-tight tracking-tight text-white sm:text-8xl lg:text-9xl"
          >
            <span className="block">Control</span>
            <span className="block text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text">
              Your Mind
            </span>
            <span className="block text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text">
              Manifest
            </span>
            <span className="block">Your Reality</span>
          </motion.h1>

          {/* Subtitle - Superconscious Style */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="max-w-5xl mx-auto text-xl leading-relaxed text-gray-300 sm:text-2xl lg:text-3xl"
          >
            Everything you seek is already within you — MitraSetu helps you access it. 
            Our advanced AI personalizes your manifestation journey, clears subconscious blocks, 
            and aligns you with your highest self. Manifestation has never been this clear, 
            this powerful, or this effortless.
          </motion.p>

          {/* CTA Button - Superconscious Style */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="pt-8"
          >
            <button
              className="px-12 py-6 text-xl font-semibold text-white transition-all duration-300 transform rounded-full group bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-105 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500"
              onClick={() => {
                navigate('/auth');
              }}
            >
              Join the Waitlist Today
              <ArrowRight
                className="ml-3 transition-transform duration-300 group-hover:translate-x-1"
                size={24}
              />
            </button>
          </motion.div>

          {/* Additional Superconscious-style elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="pt-8"
          >
            <p className="mb-4 text-lg text-gray-400">Coming in beta Spring 2025</p>
            <div className="flex justify-center space-x-8 text-gray-500">
              <span className="text-sm">Instagram</span>
              <span className="text-sm">TikTok</span>
              <span className="text-sm">Twitter X</span>
              <span className="text-sm">LinkedIn</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute transform -translate-x-1/2 bottom-10 left-1/2"
        >
          <div className="flex justify-center w-6 h-10 border-2 rounded-full border-purple-400/50">
            <div className="w-1 h-3 mt-2 bg-purple-400 rounded-full animate-bounce"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
