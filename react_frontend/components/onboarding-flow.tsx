"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { INDIAN_STATES, LANGUAGES } from "@/lib/indian-states"
import { OBJECTIVE_QUESTIONS, SUBJECTIVE_PROMPTS, calculateScores, getScoreLabel } from "@/lib/assessment-questions"
import { cn } from "@/lib/utils"
import MascotWithAnimation from "@/components/mascot-with-animation"

interface OnboardingFlowProps {
  lottieAnimationData?: any
  onComplete?: (data: UserProfile) => void
  redirectPath?: string
}

interface UserProfile {
  name: string
  nickname: string
  gender: string
  state: string
  language: string
  birthday: string
  mood: string
  assessmentType?: "objective" | "subjective"
  objectiveAnswers?: number[]
  subjectiveAnswers?: string[]
  scores?: {
    depression: number
    anxiety: number
    total: number
  }
  onboardingComplete: boolean
}

const MOOD_OPTIONS = [
  { emoji: "😄", label: "Excellent", value: "excellent" },
  { emoji: "😊", label: "Good", value: "good" },
  { emoji: "😐", label: "Okay", value: "okay" },
  { emoji: "😔", label: "Not Great", value: "not-great" },
  { emoji: "😰", label: "Struggling", value: "struggling" },
]

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"]

export default function OnboardingFlow({
  lottieAnimationData,
  onComplete,
  redirectPath = "/home",
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [profile, setProfile] = useState<Partial<UserProfile>>({})
  const [objectiveAnswers, setObjectiveAnswers] = useState<number[]>([])
  const [subjectiveAnswers, setSubjectiveAnswers] = useState<string[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [lottieData, setLottieData] = useState<any>(null)

  // Force light mode on onboarding
  useEffect(() => {
    try {
      document.documentElement.classList.remove("dark")
      // If an external theme preference exists, set it to light
      // This is safe even if next-themes is not used in this runtime
      localStorage.setItem("theme", "light")
    } catch {}
  }, [])

  useEffect(() => {
    // Load the Lottie JSON file
    fetch("/animations/mascot-hover.json")
      .then((response) => response.json())
      .then((data) => {
        setLottieData(data)
      })
      .catch((error) => {
        console.log("[v0] Could not load Lottie animation:", error)
      })
  }, [])

  const totalSteps = 12

  // Check if user has already completed onboarding
  useEffect(() => {
    const existingProfile = localStorage.getItem("userProfile")
    if (existingProfile) {
      const parsed = JSON.parse(existingProfile)
      if (parsed.onboardingComplete) {
        window.location.href = redirectPath
      }
    }
  }, [redirectPath])

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentStep((prev) => prev + 1)
      setIsAnimating(false)
    }, 200)
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

  const handleObjectiveAnswer = (questionIndex: number, value: number) => {
    const newAnswers = [...objectiveAnswers]
    newAnswers[questionIndex] = value
    setObjectiveAnswers(newAnswers)
  }

  const handleSubjectiveAnswer = (questionIndex: number, value: string) => {
    const newAnswers = [...subjectiveAnswers]
    newAnswers[questionIndex] = value
    setSubjectiveAnswers(newAnswers)
  }

  const completeOnboarding = () => {
    const finalProfile: UserProfile = {
      ...profile,
      onboardingComplete: true,
    } as UserProfile

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

    localStorage.setItem("userProfile", JSON.stringify(finalProfile))
    onComplete?.(finalProfile)
  }

  const retakeAssessment = () => {
    setCurrentStep(9)
    setObjectiveAnswers([])
    setSubjectiveAnswers([])
    setCurrentQuestionIndex(0)
    updateProfile({ assessmentType: undefined })
  }

  const renderMascotArea = () => {
    return (
      <div className="flex items-center justify-center flex-1 p-8 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center w-full h-64">
            <MascotWithAnimation
              staticImageSrc="/images/mascot.png"
              alt="Friendly mascot character"
              lottieData={lottieData}
              className="cursor-pointer"
            />
          </div>
          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-balance">
              {currentStep === 1 && "Hi there! I'm here to help you on your mental wellbeing journey."}
              {currentStep === 2 && "What should I call you?"}
              {currentStep === 3 && "Do you have a nickname you prefer?"}
              {currentStep === 4 && "How do you identify?"}
              {currentStep === 5 && "Where are you from?"}
              {currentStep === 6 && "What's your preferred language?"}
              {currentStep === 7 && "When's your birthday?"}
              {currentStep === 8 && "How are you feeling today?"}
              {currentStep === 9 && "Would you like to take a quick mental health assessment?"}
              {currentStep === 10 && "What type of assessment would you prefer?"}
              {currentStep === 11 &&
                profile.assessmentType === "objective" &&
                "Please answer these questions honestly."}
              {currentStep === 11 && profile.assessmentType === "subjective" && "Share your thoughts with me."}
              {currentStep === 12 && "Great! Here's what we learned about you."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const renderStepContent = () => {
    const baseClasses = "flex-1 flex items-center justify-center p-8"
    const contentClasses = cn(
      "w-full max-w-lg transition-all duration-300",
      isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0",
    )

    switch (currentStep) {
      case 1:
        return (
          <div className={baseClasses}>
            <div className={contentClasses}>
              <Card className="p-8 text-center">
                <CardContent className="space-y-6">
                  <h1 className="text-3xl font-bold text-balance">Welcome to Your Wellbeing Journey</h1>
                  <p className="text-lg text-muted-foreground text-balance">
                    Let's get to know you better so we can provide personalized support for your mental health.
                  </p>
                  <Button onClick={nextStep} size="lg" className="w-full">
                    Let's Begin
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 2:
        return (
          <div className={baseClasses}>
            <div className={contentClasses}>
              <Card className="p-8">
                <CardContent className="space-y-6">
                  <h2 className="text-2xl font-semibold text-balance">What should we call you?</h2>
                  <Input
                    placeholder="Enter your name"
                    value={profile.name || ""}
                    onChange={(e) => updateProfile({ name: e.target.value })}
                    className="text-lg"
                  />
                  <Button onClick={nextStep} disabled={!isStepValid()} className="w-full">
                    Continue
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 3:
        return (
          <div className={baseClasses}>
            <div className={contentClasses}>
              <Card className="p-8">
                <CardContent className="space-y-6">
                  <h2 className="text-2xl font-semibold text-balance">Do you have a nickname?</h2>
                  <Input
                    placeholder="Enter your nickname"
                    value={profile.nickname || ""}
                    onChange={(e) => updateProfile({ nickname: e.target.value })}
                    className="text-lg"
                  />
                  <Button onClick={nextStep} disabled={!isStepValid()} className="w-full">
                    Continue
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 4:
        return (
          <div className={baseClasses}>
            <div className={contentClasses}>
              <Card className="p-8">
                <CardContent className="space-y-6">
                  <h2 className="text-2xl font-semibold text-balance">How do you identify?</h2>
                  <div className="grid grid-cols-1 gap-3">
                    {GENDER_OPTIONS.map((gender) => (
                      <Button
                        key={gender}
                        variant={profile.gender === gender ? "default" : "outline"}
                        onClick={() => updateProfile({ gender })}
                        className="justify-start h-auto p-4 text-left"
                      >
                        {gender}
                      </Button>
                    ))}
                  </div>
                  <Button onClick={nextStep} disabled={!isStepValid()} className="w-full">
                    Continue
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 5:
        return (
          <div className={baseClasses}>
            <div className={contentClasses}>
              <Card className="p-8">
                <CardContent className="space-y-6">
                  <h2 className="text-2xl font-semibold text-balance">Where are you from?</h2>
                  <Select onValueChange={(value) => updateProfile({ state: value })}>
                    <SelectTrigger className="text-lg">
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={nextStep} disabled={!isStepValid()} className="w-full">
                    Continue
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 6:
        return (
          <div className={baseClasses}>
            <div className={contentClasses}>
              <Card className="p-8">
                <CardContent className="space-y-6">
                  <h2 className="text-2xl font-semibold text-balance">What's your preferred language?</h2>
                  <Select onValueChange={(value) => updateProfile({ language: value })}>
                    <SelectTrigger className="text-lg">
                      <SelectValue placeholder="Select your language" />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      {LANGUAGES.map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={nextStep} disabled={!isStepValid()} className="w-full">
                    Continue
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 7:
        return (
          <div className={baseClasses}>
            <div className={contentClasses}>
              <Card className="p-8">
                <CardContent className="space-y-6">
                  <h2 className="text-2xl font-semibold text-balance">When's your birthday?</h2>
                  <Input
                    type="date"
                    value={profile.birthday || ""}
                    onChange={(e) => updateProfile({ birthday: e.target.value })}
                    className="text-lg"
                  />
                  <Button onClick={nextStep} disabled={!isStepValid()} className="w-full">
                    Continue
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 8:
        return (
          <div className={baseClasses}>
            <div className={contentClasses}>
              <Card className="p-8">
                <CardContent className="space-y-6">
                  <h2 className="text-2xl font-semibold text-balance">How are you feeling today?</h2>
                  <div className="grid grid-cols-1 gap-3">
                    {MOOD_OPTIONS.map((mood) => (
                      <Button
                        key={mood.value}
                        variant={profile.mood === mood.value ? "default" : "outline"}
                        onClick={() => updateProfile({ mood: mood.value })}
                        className="justify-start h-auto p-4 text-left"
                      >
                        <span className="mr-3 text-2xl">{mood.emoji}</span>
                        {mood.label}
                      </Button>
                    ))}
                  </div>
                  <Button onClick={nextStep} disabled={!isStepValid()} className="w-full">
                    Continue
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 9:
        return (
          <div className={baseClasses}>
            <div className={contentClasses}>
              <Card className="p-8">
                <CardContent className="space-y-6">
                  <h2 className="text-2xl font-semibold text-balance">Mental Health Assessment</h2>
                  <p className="text-muted-foreground text-balance">
                    Would you like to take a quick assessment to help us understand your current wellbeing?
                  </p>
                  <div className="space-y-3">
                    <Button onClick={nextStep} className="w-full">
                      Start Assessment
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateProfile({ onboardingComplete: true })
                        completeOnboarding()
                        window.location.href = redirectPath
                      }}
                      className="w-full"
                    >
                      Maybe Later
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 10:
        return (
          <div className={baseClasses}>
            <div className={contentClasses}>
              <Card className="p-8">
                <CardContent className="space-y-6">
                  <h2 className="text-2xl font-semibold text-balance">Choose Assessment Type</h2>
                  <div className="space-y-4">
                    <Button
                      variant={profile.assessmentType === "objective" ? "default" : "outline"}
                      onClick={() => updateProfile({ assessmentType: "objective" })}
                      className="w-full h-auto p-4 text-left"
                    >
                      <div>
                        <div className="font-semibold">Objective Assessment</div>
                        <div className="text-sm text-muted-foreground">Multiple choice questions (6 questions)</div>
                      </div>
                    </Button>
                    <Button
                      variant={profile.assessmentType === "subjective" ? "default" : "outline"}
                      onClick={() => updateProfile({ assessmentType: "subjective" })}
                      className="w-full h-auto p-4 text-left"
                    >
                      <div>
                        <div className="font-semibold">Subjective Assessment</div>
                        <div className="text-sm text-muted-foreground">Open-ended questions (6 prompts)</div>
                      </div>
                    </Button>
                  </div>
                  <Button onClick={nextStep} disabled={!isStepValid()} className="w-full">
                    Continue
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 11:
        if (profile.assessmentType === "objective") {
          const currentQuestion = OBJECTIVE_QUESTIONS[currentQuestionIndex]
          return (
            <div className={baseClasses}>
              <div className={contentClasses}>
                <Card className="p-8">
                  <CardContent className="space-y-6">
                    <div className="text-sm text-muted-foreground">
                      Question {currentQuestionIndex + 1} of {OBJECTIVE_QUESTIONS.length}
                    </div>
                    <h2 className="text-xl font-semibold text-balance">{currentQuestion.text}</h2>
                    <div className="space-y-3">
                      {currentQuestion.options.map((option) => (
                        <Button
                          key={option.value}
                          variant={objectiveAnswers[currentQuestionIndex] === option.value ? "default" : "outline"}
                          onClick={() => handleObjectiveAnswer(currentQuestionIndex, option.value)}
                          className="justify-start w-full h-auto p-4 text-left"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      {currentQuestionIndex > 0 && (
                        <Button
                          variant="outline"
                          onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                          className="flex-1"
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
                        className="flex-1"
                      >
                        {currentQuestionIndex < OBJECTIVE_QUESTIONS.length - 1 ? "Next" : "Complete"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )
        } else {
          const currentPrompt = SUBJECTIVE_PROMPTS[currentQuestionIndex]
          return (
            <div className={baseClasses}>
              <div className={contentClasses}>
                <Card className="p-8">
                  <CardContent className="space-y-6">
                    <div className="text-sm text-muted-foreground">
                      Question {currentQuestionIndex + 1} of {SUBJECTIVE_PROMPTS.length}
                    </div>
                    <h2 className="text-xl font-semibold text-balance">{currentPrompt}</h2>
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={subjectiveAnswers[currentQuestionIndex] || ""}
                      onChange={(e) => handleSubjectiveAnswer(currentQuestionIndex, e.target.value)}
                      className="min-h-32"
                    />
                    <div className="flex gap-3">
                      {currentQuestionIndex > 0 && (
                        <Button
                          variant="outline"
                          onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                          className="flex-1"
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
                        className="flex-1"
                      >
                        {currentQuestionIndex < SUBJECTIVE_PROMPTS.length - 1 ? "Next" : "Complete"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )
        }

      case 12:
        const scores = profile.assessmentType === "objective" ? calculateScores(objectiveAnswers) : null
        return (
          <div className={baseClasses}>
            <div className={contentClasses}>
              <Card className="p-8">
                <CardContent className="space-y-6">
                  <h2 className="text-2xl font-semibold text-balance">Assessment Complete!</h2>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h3 className="mb-2 font-semibold">Your Profile</h3>
                      <p>
                        <strong>Name:</strong> {profile.name} ({profile.nickname})
                      </p>
                      <p>
                        <strong>Location:</strong> {profile.state}
                      </p>
                      <p>
                        <strong>Language:</strong> {profile.language}
                      </p>
                      <p>
                        <strong>Current Mood:</strong> {MOOD_OPTIONS.find((m) => m.value === profile.mood)?.label}
                      </p>
                    </div>

                    {profile.assessmentType === "objective" && scores && (
                      <div className="p-4 rounded-lg bg-muted/50">
                        <h3 className="mb-2 font-semibold">Assessment Results</h3>
                        <div className="space-y-2 text-sm">
                          <p>
                            <strong>Depression:</strong> {getScoreLabel(scores.depressionScore, 6)} (
                            {scores.depressionScore}/6)
                          </p>
                          <p>
                            <strong>Anxiety:</strong> {getScoreLabel(scores.anxietyScore, 6)} ({scores.anxietyScore}/6)
                          </p>
                          <p>
                            <strong>Overall:</strong> {getScoreLabel(scores.totalScore, 18)} ({scores.totalScore}/18)
                          </p>
                        </div>
                      </div>
                    )}

                    {profile.assessmentType === "subjective" && (
                      <div className="p-4 rounded-lg bg-muted/50">
                        <h3 className="mb-2 font-semibold">Your Responses</h3>
                        <p className="text-sm text-muted-foreground">
                          Thank you for sharing your thoughts. We'll use this information to provide personalized
                          support.
                        </p>
                      </div>
                    )}

                    <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                      <p className="text-sm text-yellow-800">
                        <strong>Disclaimer:</strong> This assessment is for informational purposes only and is not
                        intended for diagnosis. Please consult with a healthcare professional for proper evaluation and
                        treatment.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        completeOnboarding()
                        window.location.href = redirectPath
                      }}
                      className="w-full"
                    >
                      Go to Dashboard
                    </Button>
                    <Button variant="outline" onClick={retakeAssessment} className="w-full bg-transparent">
                      Retake Assessment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Progress Bar */}
      <div className="sticky top-0 z-40 p-4 md:p-6 border-b shadow-sm bg-white/80 backdrop-blur-lg border-slate-200/50 pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-indigo-600">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-semibold text-indigo-600">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2 md:h-3 overflow-hidden rounded-full bg-slate-200" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 lg:flex-row">
        {/* Mascot Area */}
        <div className="lg:w-1/2">{renderMascotArea()}</div>

        {/* Content Area */}
        <div className="lg:w-1/2">{renderStepContent()}</div>
      </div>
    </div>
  )
}
