import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Network, MessageSquare, Calendar, BarChart3 } from 'lucide-react';
import Section3DCanvas from './Section3DCanvas';

const Services = ({ scrollY = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const services = [
    {
      icon: Network,
      title: 'Superconscious Activations',
      description: 'AI-guided activations to shift your energy instantly.',
      features: ['Energy shifting', 'Instant activation', 'AI guidance', 'Real-time feedback']
    },
    {
      icon: MessageSquare,
      title: 'AI-Powered Vibrational Intelligence',
      description: 'Track and elevate your frequency for faster manifestation.',
      features: ['Frequency tracking', 'Vibrational analysis', 'Manifestation boost', 'Progress monitoring']
    },
    {
      icon: Calendar,
      title: 'Daily Journals & AI Feedback',
      description: 'Reflect, reframe, and grow every day.',
      features: ['Daily journaling', 'AI feedback', 'Personal growth', 'Insight tracking']
    },
    {
      icon: BarChart3,
      title: 'Manifest Your Dream Life',
      description: 'Break through mental barriers and unlock your highest potential.',
      features: ['Mental barrier removal', 'Subconscious reframing', 'Highest potential', 'Life transformation']
    }
  ];

  return (
    <section id="services" ref={ref} className="relative py-24 overflow-hidden bg-gray-800">
      {/* 3D Background */}
      <Section3DCanvas type="box" color="#ff5f7f" style={{ opacity: 0.22 }} scrollY={scrollY} />
      <div className="absolute inset-0">
        <div className="absolute top-0 rounded-full bg-purple-900/20 -left-4 w-72 h-72 mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 rounded-full bg-blue-900/20 -right-4 w-72 h-72 mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute rounded-full bg-pink-900/20 -bottom-8 left-20 w-72 h-72 mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>
      
      <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ amount: 0.1 }}
          className="mb-20 text-center"
        >
          <h2 className="mb-6 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            The Ultimate{' '}
            <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
              Manifestation Tool
            </span>
          </h2>
          <p className="max-w-4xl mx-auto text-xl leading-relaxed text-gray-300">
            The Manifestation App - superconscious
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -80 : 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: index * 0.2, ease: 'easeOut' }}
              viewport={{ amount: 0.1 }}
              className="p-8 transition-all duration-500 transform border shadow-lg group bg-gray-800/80 backdrop-blur-sm rounded-3xl hover:shadow-2xl hover:scale-105 border-gray-700/50"
            >
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-16 h-16 transition-transform duration-300 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl group-hover:scale-110">
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-2xl font-bold text-white transition-colors duration-300 group-hover:text-blue-400">
                    {service.title}
                  </h3>
                  <p className="mb-6 leading-relaxed text-gray-300">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-300">
                        <div className="w-2 h-2 mr-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 text-center"
        >
          <button className="px-12 py-6 text-xl font-semibold text-white transition-all duration-300 transform rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-2xl hover:shadow-blue-500/25 hover:scale-105">
            Explore All Features
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
