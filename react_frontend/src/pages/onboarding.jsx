"use client"

import { useState, useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import { Twemoji } from '@/components/Twemoji';

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
]

const LANGUAGES = [
  "English",
  "Hindi",
  "Bengali",
  "Telugu",
  "Marathi",
  "Tamil",
  "Gujarati",
  "Kannada",
  "Malayalam",
  "Punjabi",
  "Odia",
  "Assamese",
  "Other",
]

const OBJECTIVE_QUESTIONS = [
  {
    id: 1,
    text: "Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: 2,
    text: "Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: 3,
    text: "Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: 4,
    text: "Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: 5,
    text: "Over the last 2 weeks, how often have you had trouble falling or staying asleep, or sleeping too much?",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: 6,
    text: "Over the last 2 weeks, how often have you been bothered by poor appetite or overeating?",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
]

const SUBJECTIVE_PROMPTS = [
  "How would you describe your current emotional state?",
  "What has been your biggest challenge lately?",
  "What brings you joy or makes you feel peaceful?",
  "How do you typically cope with stress or difficult emotions?",
  "What would you like to work on or improve about your mental wellbeing?",
  "Is there anything specific you'd like support with today?",
]

const MOOD_OPTIONS = [
  { emoji: <Twemoji>😄</Twemoji>, label: 'Excellent', value: 'excellent', color: 'from-green-400 to-emerald-500' },
  { emoji: <Twemoji>😊</Twemoji>, label: 'Good', value: 'good', color: 'from-blue-400 to-cyan-500' },
  { emoji: <Twemoji>😐</Twemoji>, label: 'Okay', value: 'okay', color: 'from-yellow-400 to-orange-500' },
  { emoji: <Twemoji>😔</Twemoji>, label: 'Not Great', value: 'not-great', color: 'from-orange-400 to-red-500' },
  { emoji: <Twemoji>😰</Twemoji>, label: 'Struggling', value: 'struggling', color: 'from-red-400 to-pink-500' },
]

const GENDER_OPTIONS = [
  { label: 'Male', icon: <Twemoji>👨</Twemoji> },
  { label: 'Female', icon: <Twemoji>👩</Twemoji> },
  { label: "Non-binary", icon: "🧑" },
  { label: "Prefer not to say", icon: "❓" }
]

function calculateScores(answers) {
  const depressionScore = answers.slice(0, 2).reduce((sum, val) => sum + val, 0)
  const anxietyScore = answers.slice(2, 4).reduce((sum, val) => sum + val, 0)
  const totalScore = answers.reduce((sum, val) => sum + val, 0)
  return { depressionScore, anxietyScore, totalScore }
}

function getScoreLabel(score, maxScore) {
  const percentage = (score / maxScore) * 100
  if (percentage <= 25) return "Minimal"
  if (percentage <= 50) return "Mild"
  if (percentage <= 75) return "Moderate"
  return "Severe"
}

function MascotWithAnimation({ className = "" }) {
  const [isHovered, setIsHovered] = useState(false)
  const [fallbackToImage, setFallbackToImage] = useState(false)
  const containerRef = useRef(null)
  const lottieInstanceRef = useRef(null)

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      try {
        // Load lottie-web from CDN only if not already present
        if (!window.lottie) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js'
            script.async = true
            script.onload = resolve
            script.onerror = reject
            document.body.appendChild(script)
          })
        }
        if (!isMounted) return
        if (containerRef.current && window.lottie) {
          lottieInstanceRef.current = window.lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: '/animations/mascot-hover.json',
          })
        }
      } catch (err) {
        setFallbackToImage(true)
      }
    }
    load()
    return () => {
      isMounted = false
      try {
        lottieInstanceRef.current?.destroy()
      } catch {}
    }
  }, [])

  return (
    <div
      className={`relative ${className} transition-all duration-500 ease-out`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {fallbackToImage ? (
        <img
          src="/mascot.png"
          alt="MitraSetu mascot"
          className={`w-64 h-64 md:w-72 md:h-72 object-contain transition-all duration-500 ease-out ${
            isHovered ? 'scale-110' : 'scale-100 hover:animate-pulse'
          }`}
        />
      ) : (
        <div
          ref={containerRef}
          className={`w-64 h-64 md:w-72 md:h-72 transition-transform duration-500 bg-transparent ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
          style={{ background: 'transparent' }}
          aria-label="MitraSetu mascot animation"
        />
      )}
    </div>
  )
}

export default function OnboardingFlow({ onComplete, redirectPath = "/home" }) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [profile, setProfile] = useState({})
  const [objectiveAnswers, setObjectiveAnswers] = useState([])
  const [subjectiveAnswers, setSubjectiveAnswers] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const totalSteps = 12

  const updateProfile = (updates) => {
    setProfile((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentStep((prev) => prev + 1)
      setIsAnimating(false)
    }, 300)
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 2:
        return profile.name?.trim()
      case 3:
        return profile.nickname?.trim()
      case 4:
        return profile.gender
      case 5:
        return profile.state
      case 6:
        return profile.language
      case 7:
        return profile.birthday
      case 8:
        return profile.mood
      case 10:
        return profile.assessmentType
      case 11:
        if (profile.assessmentType === "objective") {
          return objectiveAnswers.length === OBJECTIVE_QUESTIONS.length
        } else {
          return (
            subjectiveAnswers.length === SUBJECTIVE_PROMPTS.length && subjectiveAnswers.every((answer) => answer.trim())
          )
        }
      default:
        return true
    }
  }

  const handleObjectiveAnswer = (questionIndex, value) => {
    const newAnswers = [...objectiveAnswers]
    newAnswers[questionIndex] = value
    setObjectiveAnswers(newAnswers)
  }

  const handleSubjectiveAnswer = (questionIndex, value) => {
    const newAnswers = [...subjectiveAnswers]
    newAnswers[questionIndex] = value
    setSubjectiveAnswers(newAnswers)
  }

  const completeOnboarding = () => {
    const finalProfile = {
      ...profile,
      onboardingComplete: true,
      completedAt: new Date().toISOString(),
    }

    if (profile.assessmentType === "objective") {
      const scores = calculateScores(objectiveAnswers)
      finalProfile.objectiveAnswers = objectiveAnswers
      finalProfile.scores = {
        depression: scores.depressionScore,
        anxiety: scores.anxietyScore,
        total: scores.totalScore,
      }
    } else if (profile.assessmentType === "subjective") {
      finalProfile.subjectiveAnswers = subjectiveAnswers
    }

    // Store in localStorage for persistence
    localStorage.setItem('userProfile', JSON.stringify(finalProfile))
    
    // Also call the onComplete callback if providedF
    onComplete?.(finalProfile)
  }

  const retakeAssessment = () => {
    setCurrentStep(9)
    setObjectiveAnswers([])
    setSubjectiveAnswers([])
    setCurrentQuestionIndex(0)
    updateProfile({ assessmentType: undefined })
  }

  const renderStepContent = () => {
    const contentClasses = cn(
      "transition-all duration-500 ease-out",
      isAnimating ? "opacity-0 translate-y-8 scale-95" : "opacity-100 translate-y-0 scale-100"
    )

    switch (currentStep) {
      case 1:
        return (
          <div className={contentClasses}>
            <div className="space-y-8 text-center">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text">
                  Welcome to MitraSetu
                </h1>
                <p className="max-w-md mx-auto text-xl leading-relaxed text-slate-600">
                  Your personalized mental wellbeing companion is here to support you every step of the way
                </p>
              </div>
              <Button
                onClick={nextStep}
                size="lg"
                className="px-12 py-4 text-lg font-semibold text-white transition-all duration-300 rounded-full shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:shadow-xl hover:scale-105"
              >
                Let's Get Started
              </Button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className={contentClasses}>
            <div className="space-y-8">
              <div className="space-y-3 text-center">
                <h2 className="text-3xl font-bold text-slate-800">What's your name?</h2>
                <p className="text-slate-600">Let's start with the basics</p>
              </div>
              <div className="space-y-6">
                <Input
                  placeholder="Enter your full name"
                  value={profile.name || ""}
                  onChange={(e) => updateProfile({ name: e.target.value })}
                  className="text-lg transition-all duration-300 border-2 h-14 border-slate-200 focus:border-indigo-400 focus:ring-indigo-200 rounded-xl"
                />
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="w-full text-lg font-semibold text-white transition-all duration-300 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 rounded-xl hover:scale-105"
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className={contentClasses}>
            <div className="space-y-8">
              <div className="space-y-3 text-center">
                <h2 className="text-3xl font-bold text-slate-800">Any nickname?</h2>
                <p className="text-slate-600">What would you like me to call you?</p>
              </div>
              <div className="space-y-6">
                <Input
                  placeholder="Enter your preferred nickname"
                  value={profile.nickname || ""}
                  onChange={(e) => updateProfile({ nickname: e.target.value })}
                  className="text-lg transition-all duration-300 border-2 h-14 border-slate-200 focus:border-indigo-400 focus:ring-indigo-200 rounded-xl"
                />
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="w-full text-lg font-semibold text-white transition-all duration-300 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 rounded-xl hover:scale-105"
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className={contentClasses}>
            <div className="space-y-8">
              <div className="space-y-3 text-center">
                <h2 className="text-3xl font-bold text-slate-800">How do you identify?</h2>
                <p className="text-slate-600">This helps us personalize your experience</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {GENDER_OPTIONS.map((gender) => (
                  <Button
                    key={gender.label}
                    variant={profile.gender === gender.label ? "default" : "outline"}
                    onClick={() => updateProfile({ gender: gender.label })}
                    className={cn(
                      "h-16 justify-start text-left text-lg font-medium rounded-xl transition-all duration-300 hover:scale-105",
                      profile.gender === gender.label
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                        : "border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
                    )}
                  >
                    <span className="mr-4 text-2xl">{gender.icon}</span>
                    {gender.label}
                  </Button>
                ))}
              </div>
              <Button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="w-full text-lg font-semibold text-white transition-all duration-300 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 rounded-xl hover:scale-105"
              >
                Continue
              </Button>
            </div>
          </div>
        )

      case 5:
        return (
          <div className={contentClasses}>
            <div className="space-y-8">
              <div className="space-y-3 text-center">
                <h2 className="text-3xl font-bold text-slate-800">Where are you from?</h2>
                <p className="text-slate-600">Select your state or territory</p>
              </div>
              <div className="space-y-6">
                <Select onValueChange={(value) => updateProfile({ state: value })}>
                  <SelectTrigger className="text-lg border-2 h-14 border-slate-200 focus:border-indigo-400 focus:ring-indigo-200 rounded-xl">
                    <SelectValue placeholder="Choose your state" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl z-[60]">
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state} className="py-3 text-base rounded-lg">
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="w-full text-lg font-semibold text-white transition-all duration-300 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 rounded-xl hover:scale-105"
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className={contentClasses}>
            <div className="space-y-8">
              <div className="space-y-3 text-center">
                <h2 className="text-3xl font-bold text-slate-800">Preferred language?</h2>
                <p className="text-slate-600">We'll communicate in your comfort language</p>
              </div>
              <div className="space-y-6">
                <Select onValueChange={(value) => updateProfile({ language: value })}>
                  <SelectTrigger className="text-lg border-2 h-14 border-slate-200 focus:border-indigo-400 focus:ring-indigo-200 rounded-xl">
                    <SelectValue placeholder="Select your language" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl z-[60]">
                    {LANGUAGES.map((language) => (
                      <SelectItem key={language} value={language} className="py-3 text-base rounded-lg">
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="w-full text-lg font-semibold text-white transition-all duration-300 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 rounded-xl hover:scale-105"
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        )

      case 7:
        return (
          <div className={contentClasses}>
            <div className="space-y-8">
              <div className="space-y-3 text-center">
                <h2 className="text-3xl font-bold text-slate-800">When's your birthday?</h2>
                <p className="text-slate-600">We'll send you special wishes</p>
              </div>
              <div className="space-y-6">
                <Input
                  type="date"
                  value={profile.birthday || ""}
                  onChange={(e) => updateProfile({ birthday: e.target.value })}
                  className="text-lg transition-all duration-300 border-2 h-14 border-slate-200 focus:border-indigo-400 focus:ring-indigo-200 rounded-xl"
                />
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="w-full text-lg font-semibold text-white transition-all duration-300 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 rounded-xl hover:scale-105"
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        )

      case 8:
        return (
          <div className={contentClasses}>
            <div className="space-y-8">
              <div className="space-y-3 text-center">
                <h2 className="text-3xl font-bold text-slate-800">How are you feeling today?</h2>
                <p className="text-slate-600">Your current mood helps us understand you better</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {MOOD_OPTIONS.map((mood) => (
                  <Button
                    key={mood.value}
                    variant={profile.mood === mood.value ? "default" : "outline"}
                    onClick={() => updateProfile({ mood: mood.value })}
                    className={cn(
                      "h-16 justify-start text-left text-lg font-medium rounded-xl transition-all duration-300 hover:scale-105 group",
                      profile.mood === mood.value
                        ? `bg-gradient-to-r ${mood.color} text-white shadow-lg`
                        : "border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
                    )}
                  >
                    <span className="mr-4 text-3xl group-hover:animate-bounce">{mood.emoji}</span>
                    <div>
                      <div className="font-semibold">{mood.label}</div>
                    </div>
                  </Button>
                ))}
              </div>
              <Button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="w-full text-lg font-semibold text-white transition-all duration-300 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 rounded-xl hover:scale-105"
              >
                Continue
              </Button>
            </div>
          </div>
        )

      case 9:
        return (
          <div className={contentClasses}>
            <div className="space-y-8">
              <div className="space-y-3 text-center">
                <h2 className="text-3xl font-bold text-slate-800">Mental Health Assessment</h2>
                <p className="text-slate-600">Help us understand your current wellbeing with a quick assessment</p>
              </div>
              <div className="space-y-4">
                <Button
                  onClick={nextStep}
                  className="w-full h-16 text-lg font-semibold text-white transition-all duration-300 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl hover:scale-105"
                >
                  <span className="mr-3">📋</span>
                  Take Assessment
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    updateProfile({ onboardingComplete: true })
                    completeOnboarding()
                    navigate('/home')
                  }}
                  className="w-full text-lg font-medium transition-all duration-300 border-2 h-14 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 rounded-xl"
                >
                  Skip for Now
                </Button>
              </div>
            </div>
          </div>
        )

      case 10:
        return (
          <div className={contentClasses}>
            <div className="space-y-8">
              <div className="space-y-3 text-center">
                <h2 className="text-3xl font-bold text-slate-800">Choose Assessment Type</h2>
                <p className="text-slate-600">Pick the format that feels most comfortable</p>
              </div>
              <div className="space-y-4">
                <Button
                  variant={profile.assessmentType === "objective" ? "default" : "outline"}
                  onClick={() => updateProfile({ assessmentType: "objective" })}
                  className={cn(
                    "w-full h-auto p-6 text-left rounded-xl transition-all duration-300 hover:scale-105 group",
                    profile.assessmentType === "objective"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                      : "border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
                  )}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl group-hover:animate-pulse">📊</span>
                    <div>
                      <div className="mb-1 text-xl font-semibold">Structured Questions</div>
                      <div className="text-base opacity-80">6 multiple choice questions</div>
                    </div>
                  </div>
                </Button>
                <Button
                  variant={profile.assessmentType === "subjective" ? "default" : "outline"}
                  onClick={() => updateProfile({ assessmentType: "subjective" })}
                  className={cn(
                    "w-full h-auto p-6 text-left rounded-xl transition-all duration-300 hover:scale-105 group",
                    profile.assessmentType === "subjective"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                      : "border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
                  )}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl group-hover:animate-pulse">💭</span>
                    <div>
                      <div className="mb-1 text-xl font-semibold">Open Reflection</div>
                      <div className="text-base opacity-80">6 thoughtful prompts</div>
                    </div>
                  </div>
                </Button>
              </div>
              <Button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="w-full text-lg font-semibold text-white transition-all duration-300 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 rounded-xl hover:scale-105"
              >
                Continue
              </Button>
            </div>
          </div>
        )

      case 11:
        if (profile.assessmentType === "objective") {
          const currentQuestion = OBJECTIVE_QUESTIONS[currentQuestionIndex]
          return (
            <div className={contentClasses}>
              <div className="space-y-8">
                <div className="space-y-3 text-center">
                  <div className="flex items-center justify-center space-x-2 text-lg font-medium text-indigo-600">
                    <span>Question {currentQuestionIndex + 1}</span>
                    <span>of</span>
                    <span>{OBJECTIVE_QUESTIONS.length}</span>
                  </div>
                  <h2 className="text-2xl font-bold leading-relaxed text-slate-800">
                    {currentQuestion.text}
                  </h2>
                </div>
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <Button
                      key={option.value}
                      variant={objectiveAnswers[currentQuestionIndex] === option.value ? "default" : "outline"}
                      onClick={() => handleObjectiveAnswer(currentQuestionIndex, option.value)}
                      className={cn(
                        "w-full h-16 justify-start text-left text-lg font-medium rounded-xl transition-all duration-300 hover:scale-105",
                        objectiveAnswers[currentQuestionIndex] === option.value
                          ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                          : "border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-6 h-6 border-2 border-current rounded-full">
                          <div className={cn(
                            "w-3 h-3 rounded-full transition-all duration-200",
                            objectiveAnswers[currentQuestionIndex] === option.value ? "bg-white" : "bg-transparent"
                          )} />
                        </div>
                        <span>{option.label}</span>
                      </div>
                    </Button>
                  ))}
                </div>
                <div className="flex gap-4">
                  {currentQuestionIndex > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                      className="flex-1 text-lg font-medium transition-all duration-300 border-2 h-14 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 rounded-xl"
                    >
                      Previous
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      if (currentQuestionIndex < OBJECTIVE_QUESTIONS.length - 1) {
                        setCurrentQuestionIndex((prev) => prev + 1)
                      } else {
                        nextStep()
                      }
                    }}
                    disabled={objectiveAnswers[currentQuestionIndex] === undefined}
                    className="flex-1 text-lg font-semibold text-white transition-all duration-300 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 rounded-xl"
                  >
                    {currentQuestionIndex < OBJECTIVE_QUESTIONS.length - 1 ? "Next Question" : "Complete Assessment"}
                  </Button>
                </div>
              </div>
            </div>
          )
        } else {
          const currentPrompt = SUBJECTIVE_PROMPTS[currentQuestionIndex]
          return (
            <div className={contentClasses}>
              <div className="space-y-8">
                <div className="space-y-3 text-center">
                  <div className="flex items-center justify-center space-x-2 text-lg font-medium text-indigo-600">
                    <span>Question {currentQuestionIndex + 1}</span>
                    <span>of</span>
                    <span>{SUBJECTIVE_PROMPTS.length}</span>
                  </div>
                  <h2 className="text-2xl font-bold leading-relaxed text-slate-800">
                    {currentPrompt}
                  </h2>
                </div>
                <Textarea
                  placeholder="Take your time to reflect and share your thoughts..."
                  value={subjectiveAnswers[currentQuestionIndex] || ""}
                  onChange={(e) => handleSubjectiveAnswer(currentQuestionIndex, e.target.value)}
                  className="text-lg transition-all duration-300 border-2 resize-none min-h-32 border-slate-200 focus:border-indigo-400 focus:ring-indigo-200 rounded-xl"
                />
                <div className="flex gap-4">
                  {currentQuestionIndex > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                      className="flex-1 text-lg font-medium transition-all duration-300 border-2 h-14 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 rounded-xl"
                    >
                      Previous
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      if (currentQuestionIndex < SUBJECTIVE_PROMPTS.length - 1) {
                        setCurrentQuestionIndex((prev) => prev + 1)
                      } else {
                        nextStep()
                      }
                    }}
                    disabled={!subjectiveAnswers[currentQuestionIndex]?.trim()}
                    className="flex-1 text-lg font-semibold text-white transition-all duration-300 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 rounded-xl"
                  >
                    {currentQuestionIndex < SUBJECTIVE_PROMPTS.length - 1 ? "Next Question" : "Complete Assessment"}
                  </Button>
                </div>
              </div>
            </div>
          )
        }

      case 12:
        const scores = profile.assessmentType === "objective" ? calculateScores(objectiveAnswers) : null
        return (
          <div className={contentClasses}>
            <div className="space-y-8">
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-center w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-green-400 to-emerald-500">
                  <span className="text-3xl">✨</span>
                </div>
                <h2 className="text-3xl font-bold text-slate-800">All Set!</h2>
                <p className="text-slate-600">Here's your personalized profile summary</p>
              </div>

              <div className="space-y-6">
                <Card className="p-6 border-2 border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl">
                  <CardContent className="p-0 space-y-4">
                    <h3 className="flex items-center text-xl font-semibold text-indigo-800">
                      <span className="mr-2">👤</span>
                      Your Profile
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-slate-700">
                      <div>
                        <span className="font-medium">Name:</span> {profile.name}
                      </div>
                      <div>
                        <span className="font-medium">Nickname:</span> {profile.nickname}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span> {profile.state}
                      </div>
                      <div>
                        <span className="font-medium">Language:</span> {profile.language}
                      </div>
                      <div>
                        <span className="font-medium">Current Mood:</span> {MOOD_OPTIONS.find((m) => m.value === profile.mood)?.label}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {profile.assessmentType === "objective" && scores && (
                  <Card className="p-6 border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
                    <CardContent className="p-0 space-y-4">
                      <h3 className="flex items-center text-xl font-semibold text-blue-800">
                        <span className="mr-2">📊</span>
                        Assessment Results
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/60">
                          <span className="font-medium text-slate-700">Depression Score:</span>
                          <span className="font-semibold text-blue-600">
                            {getScoreLabel(scores.depressionScore, 6)} ({scores.depressionScore}/6)
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/60">
                          <span className="font-medium text-slate-700">Anxiety Score:</span>
                          <span className="font-semibold text-blue-600">
                            {getScoreLabel(scores.anxietyScore, 6)} ({scores.anxietyScore}/6)
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/60">
                          <span className="font-medium text-slate-700">Overall Score:</span>
                          <span className="font-semibold text-blue-600">
                            {getScoreLabel(scores.totalScore, 18)} ({scores.totalScore}/18)
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {profile.assessmentType === "subjective" && (
                  <Card className="p-6 border-2 border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
                    <CardContent className="p-0 space-y-4">
                      <h3 className="flex items-center text-xl font-semibold text-green-800">
                        <span className="mr-2">💭</span>
                        Your Reflections
                      </h3>
                      <p className="text-slate-700">
                        Thank you for sharing your thoughtful responses. We'll use these insights to provide personalized support tailored to your unique journey.
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Card className="p-6 border-2 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-100 rounded-2xl">
                  <CardContent className="p-0 space-y-3">
                    <h3 className="flex items-center text-lg font-semibold text-amber-800">
                      <span className="mr-2">⚠️</span>
                      Important Note
                    </h3>
                    <p className="text-amber-800">
                      This assessment is for informational purposes only and should not be used for diagnosis. 
                      Please consult with a healthcare professional for proper evaluation and treatment.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => {
                    completeOnboarding()
                    if (redirectPath) window.location.href = redirectPath
                  }}
                  className="w-full h-16 text-lg font-semibold text-white transition-all duration-300 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl hover:scale-105"
                >
                  <span className="mr-3">🚀</span>
                  Start Your Journey
                </Button>
                <Button
                  variant="outline"
                  onClick={retakeAssessment}
                  className="w-full text-lg font-medium transition-all duration-300 border-2 h-14 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 rounded-xl"
                >
                  Retake Assessment
                </Button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Progress Bar */}
  <div className="sticky top-0 z-30 p-4 border-b shadow-sm pointer-events-none md:p-6 bg-white/80 backdrop-blur-lg border-slate-200/50">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-indigo-600">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-semibold text-indigo-600">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
          <Progress 
            value={(currentStep / totalSteps) * 100} 
            className="h-2 overflow-hidden rounded-full md:h-3 bg-slate-200"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-120px)]">
        {/* Mascot Area */}
        <div className="flex items-center justify-center p-8 lg:w-1/2 lg:p-12 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30">
          <div className="w-full max-w-md space-y-8">
            <div className="flex justify-center">
              <MascotWithAnimation className="cursor-pointer" />
            </div>
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-indigo-800 bg-indigo-100 rounded-full">
                Metoo Assistant ( MitrAI )
              </div>
              <p className="text-lg font-medium leading-relaxed text-slate-700">
                {currentStep === 1 &&
                  "Hi there! I'm MitrAI, your friendly companion on this mental wellbeing journey. Let's create something amazing together!"}
                {currentStep === 2 && "Nice to meet you! What should I call you?"}
                {currentStep === 3 && "Perfect! Do you have a nickname you prefer?"}
                {currentStep === 4 && "Got it! How do you identify yourself?"}
                {currentStep === 5 && "Wonderful! Where are you located?"}
                {currentStep === 6 && "Excellent! What language feels most comfortable?"}
                {currentStep === 7 && "Great! When do you celebrate your birthday?"}
                {currentStep === 8 && "Thank you for sharing! How's your mood today?"}
                {currentStep === 9 && "Amazing progress! Ready for a quick wellbeing check?"}
                {currentStep === 10 && "Perfect! Which assessment style works best for you?"}
                {currentStep === 11 &&
                  profile.assessmentType === "objective" &&
                  "You're doing great! Just answer honestly - there are no wrong answers."}
                {currentStep === 11 && profile.assessmentType === "subjective" && "Take your time to reflect. Your thoughts matter to us."}
                {currentStep === 12 && "Fantastic! You've completed your profile. Ready to begin your journey?"}
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex items-center justify-center p-8 lg:w-1/2 lg:p-12">
          <div className="w-full max-w-lg">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </div>
  )
}