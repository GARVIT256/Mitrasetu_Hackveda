import { MessageCircle, Sparkles, Users, Globe } from "lucide-react"
import {useNavigate} from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="container px-4 py-6 mx-auto">
        <nav className="flex items-center justify-between">
          {/* Updated logo and removed MitraSetu text */}
          <div className="flex items-center">
            <img
              src="/colored-logo.png"
              alt="MitraSetu Logo"
              width={300}
              height={100}
              className="h-20 w-auto max-w-[180px] md:h-24 md:max-w-[220px] lg:h-28 lg:max-w-[260px]"
            />
          </div>
          <div className="items-center hidden space-x-6 md:flex">
            <button
              className="px-5 py-2 font-semibold text-purple-700 bg-white border border-purple-300 rounded-lg shadow-sm hover:bg-purple-50 hover:border-purple-400 transition-all"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Features
            </button>
            <a href="#about" className="text-purple-700 transition-colors hover:text-purple-900 font-semibold px-5 py-2">
              About
            </a>
            <button
              className="px-5 py-2 font-semibold text-purple-700 bg-white border border-purple-300 rounded-lg shadow-sm hover:bg-purple-50 hover:border-purple-400 transition-all"
              onClick={() => navigate('/onboarding')}
            >
              Let's Begin
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container px-4 py-20 mx-auto min-h-[60vh]">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Content: Gradient Heading and Button */}
          <div className="flex flex-col items-center justify-center w-full space-y-8 text-center">
            <h1 className="text-center text-6xl md:text-7xl font-extrabold leading-tight mb-10 bg-gradient-to-r from-purple-500 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Stronger minds together<br />
              <span className="block mt-2 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-400 bg-clip-text text-transparent">with MitraSetu</span>
            </h1>
            <button
              className="mt-8 px-12 py-5 text-2xl font-semibold rounded-2xl shadow-lg bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400 text-white hover:scale-105 transition-all"
              onClick={() => navigate('/onboarding')}
            >
              GET STARTED
            </button>
          </div>

          {/* Right Illustration: Mascot and Floating Icons */}
          <div className="relative">
            <div className="relative flex items-center justify-center">
              {/* Floating icons for visual interest */}
              <div className="absolute left-[-40px] top-10 animate-float-slow text-3xl opacity-70 select-none">💬</div>
              <div className="absolute text-2xl select-none left-10 bottom-20 animate-float-fast opacity-60">💜</div>
              <div className="absolute text-2xl select-none right-10 top-24 animate-float-mid opacity-60">✨</div>
              <img
                src="/mitra.png"
                alt="MitraSetu AI Chat Interface"
                width={400}
                height={600}
                className="w-[320px] md:w-[380px] lg:w-[420px] h-auto drop-shadow-2xl"
              />
              <div className="absolute p-3 bg-purple-300 rounded-bl-sm shadow-lg top-8 left-8 rounded-2xl animate-pulse">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </div>
              </div>
              <div
                className="absolute p-3 bg-pink-300 rounded-br-sm shadow-lg bottom-8 right-8 rounded-2xl animate-pulse"
                style={{ animationDelay: "0.5s" }}
              >
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="container px-4 py-16 mx-auto">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-purple-900">Why Choose MitraSetu?</h2>
          <p className="max-w-2xl mx-auto text-lg text-purple-600">
            Experience the power of AI that understands culture, context, and connection
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="p-6 transition-shadow bg-white border border-purple-200 rounded-lg hover:shadow-lg">
            <div className="flex items-center justify-center w-12 h-12 mb-4 bg-purple-600 rounded-lg">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-purple-900">Cultural Bridge</h3>
            <p className="text-purple-600">
              Seamlessly connect across cultures with AI that understands context and nuance
            </p>
          </div>

          <div className="p-6 transition-shadow bg-white border border-purple-200 rounded-lg hover:shadow-lg">
            <div className="flex items-center justify-center w-12 h-12 mb-4 bg-purple-600 rounded-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-purple-900">Smart Conversations</h3>
            <p className="text-purple-600">
              Engage in natural, intelligent conversations that feel human and authentic
            </p>
          </div>

          <div className="p-6 transition-shadow bg-white border border-purple-200 rounded-lg hover:shadow-lg">
            <div className="flex items-center justify-center w-12 h-12 mb-4 bg-purple-600 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-purple-900">Community Focused</h3>
            <p className="text-purple-600">
              Built for communities, families, and friends to stay connected across distances
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 py-16 mx-auto">
        <div className="p-8 text-center text-white bg-purple-600 rounded-3xl md:p-12">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to Bridge the Gap?</h2>
          <p className="max-w-2xl mx-auto mb-8 text-xl opacity-90">
            Join thousands of users who are already experiencing seamless, culturally-aware AI conversations
          </p>
          <button onClick={() => navigate('/onboarding')} className="flex items-center justify-center gap-2 px-8 py-3 text-lg font-semibold text-purple-700 transition-colors bg-white rounded-md hover:bg-purple-50">
            Get Started Today
            <Sparkles className="w-5 h-5 ml-2" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container px-4 py-8 mx-auto border-t border-purple-200">
        <div className="flex flex-col items-center justify-between md:flex-row">
          {/* Updated footer logo and removed MitraSetu text */}
          <div className="flex items-center mb-4 md:mb-0">
            <img
              src="/colored-logo.png"
              alt="MitraSetu Logo"
              width={220}
              height={70}
              className="h-16 w-auto max-w-[140px] md:h-20 md:max-w-[180px]"
            />
          </div>
          <div className="flex space-x-6 text-sm text-purple-600">
            <a href="#" className="transition-colors hover:text-purple-900">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-purple-900">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-purple-900">
              Support
            </a>
          </div>
        </div>
      </footer>

            <style>{`
              @keyframes float-slow {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-18px); }
              }
              .animate-float-slow { animation: float-slow 5s ease-in-out infinite; }
              @keyframes float-fast {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
              }
              .animate-float-fast { animation: float-fast 2.5s ease-in-out infinite; }
              @keyframes float-mid {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-14px); }
              }
              .animate-float-mid { animation: float-mid 3.5s ease-in-out infinite; }
            `}</style>
    </div>
  )
}