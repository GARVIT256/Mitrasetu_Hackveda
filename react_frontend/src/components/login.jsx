import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useAuth0 } from "@auth0/auth0-react"
import { useNavigate } from "react-router-dom"

function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '' 
  })
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, loginWithRedirect, error } = useAuth0()

  // Redirect after auth in effect to avoid setState during render warning
  useEffect(() => {
    if (isAuthenticated) navigate('/home')
  }, [isAuthenticated, navigate])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-purple-700">
        <div className="mb-2 font-semibold">Authentication error</div>
        <div className="text-sm opacity-80">{String(error.message || 'Something went wrong')}</div>
      </div>
    )
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen text-purple-600">Loading…</div>
  }

  // Placeholder for anonymous login handler
  const handleAnonymousLogin = () => {
    // TODO: Implement anonymous login logic here
    alert('Logged in anonymously!')
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(isLogin ? 'Login' : 'Sign Up', formData)
  }

  // Animated mascot pointing gesture
  const MascotPointing = () => (
    <motion.div
      className="relative flex flex-col items-center"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Main mascot blob */}
      <motion.div
        className="relative flex items-center justify-center rounded-full w-80 h-80"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%)',
        }}
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        {/* Mascot face */}
        <motion.div
          className="relative flex items-center justify-center w-64 h-64 overflow-hidden bg-white rounded-full"
          animate={{ scale: [1, 1.01, 1] }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          
          {/* Eyes */}
          <div className="absolute flex space-x-8 top-20 left-16">
            <motion.div 
              className="w-6 h-6 bg-black rounded-full"
              animate={{ 
                scaleY: [1, 0.1, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                repeatDelay: 2 
              }}
            />
            <motion.div 
              className="w-6 h-6 bg-black rounded-full"
              animate={{ 
                scaleY: [1, 0.1, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                repeatDelay: 2 
              }}
            />
          </div>
          
          {/* Smile */}
          <motion.div 
            className="absolute w-16 h-8 border-4 border-t-0 border-black rounded-b-full bottom-20"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
          
          {/* Cheek blushes */}
          <div className="absolute w-8 h-6 bg-pink-300 rounded-full top-24 left-8 opacity-60" />
          <div className="absolute w-8 h-6 bg-pink-300 rounded-full top-24 right-8 opacity-60" />
        </motion.div>
        
        {/* Pointing arm */}
        <motion.div
          className="absolute right-0 w-24 h-8 origin-left rounded-full top-32 bg-gradient-to-r from-purple-500 to-pink-500"
          style={{ transformOrigin: 'left center' }}
          animate={{ rotate: [-5, 3, -5], scaleX: [1, 1.05, 1] }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {/* Hand */}
          <div className="absolute right-0 w-6 h-6 transform -translate-y-1/2 bg-purple-400 rounded-full top-1/2" />
        </motion.div>
      </motion.div>
      
      {/* Speech bubble */}
      <motion.div
        className="absolute px-4 py-2 bg-white border-2 border-purple-200 shadow-lg -top-8 -right-16 rounded-2xl"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <p className="font-medium text-purple-700">Welcome! 👉</p>
        <div className="absolute bottom-0 w-0 h-0 transform translate-y-full border-t-4 border-l-4 border-r-4 border-transparent left-8 border-t-white" />
      </motion.div>
    </motion.div>
  )

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute rounded-full w-96 h-96 opacity-20 bg-gradient-to-br from-purple-400 to-pink-400"
          style={{ top: '-10%', left: '-10%' }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute rounded-full w-80 h-80 opacity-20 bg-gradient-to-br from-pink-400 to-orange-400"
          style={{ top: '20%', right: '-10%' }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left side - Mascot */}
        <div className="items-center justify-center hidden p-12 lg:flex lg:w-1/2 xl:w-3/5">
          <div className="flex flex-col items-center">
            <MascotPointing />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.6 }}
              className="mt-8 text-center"
            >
              <h1 className="mb-4 text-4xl font-bold text-purple-900">
                MitraSetu
              </h1>
              <p className="mb-2 text-xl text-purple-700">
                Your Friendly AI Bridge
              </p>
              <p className="max-w-md text-purple-600">
                Connecting cultures through intelligent conversation. 
                Experience seamless communication that understands context, culture, and connection.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="flex items-center justify-center w-full p-6 lg:w-1/2 xl:w-2/5">
          <div className="w-full max-w-md">
            {/* Header */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8 text-center"
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
                <span className="text-2xl">🤖</span>
              </div>
              <h2 className="mb-2 text-3xl font-bold text-purple-900">
                MitraSetu
              </h2>
              <p className="text-purple-600">
                {isLogin ? 'Welcome back!' : 'Join our community'}
              </p>
            </motion.div>

            {/* Login form container */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="p-8 border shadow-2xl bg-white/80 backdrop-blur-xl rounded-3xl border-white/20"
            >
              {/* Toggle buttons */}
              <div className="flex p-1 mb-6 bg-purple-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    isLogin 
                      ? 'bg-white text-purple-900 shadow-md' 
                      : 'text-purple-600'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    !isLogin 
                      ? 'bg-white text-purple-900 shadow-md' 
                      : 'text-purple-600'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Login form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="relative">
                        <User className="absolute w-5 h-5 text-purple-500 transform -translate-y-1/2 left-4 top-1/2" />
                        <input
                          type="text"
                          name="fullName"
                          placeholder="Full Name"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full py-4 pl-12 pr-4 bg-white border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative">
                  <Mail className="absolute w-5 h-5 text-purple-500 transform -translate-y-1/2 left-4 top-1/2" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full py-4 pl-12 pr-4 bg-white border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute w-5 h-5 text-purple-500 transform -translate-y-1/2 left-4 top-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full py-4 pl-12 pr-12 bg-white border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute text-purple-500 transform -translate-y-1/2 right-4 top-1/2"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center text-purple-600">
                      <input type="checkbox" className="mr-2 rounded" />
                      Remember me
                    </label>
                    <button type="button" className="font-medium text-purple-500 hover:text-purple-700">
                      Forgot Password?
                    </button>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-4 font-medium text-white transition-all shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl"
                >
                  {isLogin ? 'Login' : 'Create Account'}
                </motion.button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-purple-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 text-purple-600 bg-white">Or continue with</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => loginWithRedirect({ authorizationParams: { redirect_uri: `${window.location.origin}/home` } })}
                    className="flex items-center justify-center w-full py-4 font-medium text-purple-700 transition-colors bg-white border border-purple-200 rounded-xl hover:bg-purple-50"
                  >
                    <span className="mr-2">🔗</span>
                    Continue with Google
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleAnonymousLogin}
                    className="flex items-center justify-center w-full py-4 font-medium text-purple-700 transition-colors bg-white border border-purple-200 rounded-xl hover:bg-purple-50"
                  >
                    <span className="mr-2">👤</span>
                    Login Anonymously
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-purple-600">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="font-medium text-purple-500 hover:text-purple-700"
                    >
                      {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                  </p>
                </div>
              </form>
            </motion.div>

            {/* Terms and Privacy */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="mt-6 text-center"
              >
                <p className="text-xs text-purple-600">
                  By signing up, you agree to our{' '}
                  <a href="#" className="underline hover:text-purple-800">
                    Terms & Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="underline hover:text-purple-800">
                    Privacy Policy
                  </a>
                </p>
              </motion.div>
            )}

            {/* Need help link */}
            <div className="mt-4 text-center">
              <a 
                href="https://www.mhanational.org/get-involved/contact-us" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-purple-600 underline hover:text-purple-800"
              >
                Need help? Mental Health Resources
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login