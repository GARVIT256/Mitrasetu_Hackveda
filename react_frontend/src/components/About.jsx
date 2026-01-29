import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Heart, Zap, Shield } from 'lucide-react';
import Section3DCanvas from './Section3DCanvas';

const About = ({ scrollY = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const features = [
    {
      icon: Users,
      title: 'Input Your Current Reality & Desired Results',
      description: 'Reflect on where you are and where you want to be.'
    },
    {
      icon: Heart,
      title: 'AI Analyzes Subconscious Patterns & Beliefs',
      description: 'Receive tailored meditations, journaling prompts, and insights.'
    },
    {
      icon: Zap,
      title: 'AI Creates Your Personalized Manifestation Journey',
      description: 'Experience a personalized path to clarity, focus, and manifestation.'
    },
    {
      icon: Shield,
      title: 'Adapt and Grow with MitraSetu',
      description: 'Transform Your Mindset and Results'
    }
  ];

  return (
    <section id="about" ref={ref} className="relative py-24 overflow-hidden bg-gray-900">
      {/* 3D Background */}
      <Section3DCanvas type="torus" color="#7f5fff" style={{ opacity: 0.25 }} scrollY={scrollY} />
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
      
      <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ amount: 0.1 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-6 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            Upgrade{' '}
            <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
              Your Reality
            </span>
          </h2>
          <p className="max-w-4xl mx-auto text-xl leading-relaxed text-gray-300">
            Everything you seek is already within you — MitraSetu helps you access it. 
            Our advanced AI personalizes your manifestation journey, clears subconscious blocks, 
            and aligns you with your highest self.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -80 : 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: index * 0.1, ease: 'easeOut' }}
              viewport={{ amount: 0.1 }}
              className="p-8 transition-all duration-300 transform border border-gray-700 shadow-lg group bg-gray-800/70 backdrop-blur-sm rounded-2xl hover:shadow-2xl hover:scale-105"
            >
              <div className="flex items-center justify-center w-16 h-16 mb-6 transition-transform duration-300 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl group-hover:scale-110">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-white transition-colors duration-300 group-hover:text-blue-400">
                {feature.title}
              </h3>
              <p className="leading-relaxed text-gray-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative mt-20 text-center"
        >
          {/* 3D for Join the MitraSetu Community */}
          <div className="absolute inset-0 w-full h-full -z-10">
            <Section3DCanvas type="sphere" color="#5fffd7" style={{ opacity: 0.18 }} scrollY={scrollY} />
          </div>
          <div className="relative z-10 p-12 text-white bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl">
            <h3 className="mb-6 text-3xl font-bold sm:text-4xl">
              Hyper-Personalized Imagination Sessions
            </h3>
            <p className="max-w-3xl mx-auto mb-8 text-xl opacity-90">
              Tap into the frequency of your highest self. AI-guided activations to shift your energy instantly.
            </p>
            <button className="px-8 py-4 text-lg font-semibold text-white transition-all duration-300 transform rounded-full shadow-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 hover:scale-105">
              Start Your Journey
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
