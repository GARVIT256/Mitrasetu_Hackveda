"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"

interface UserProfile {
  name: string
  nickname: string
  gender: string
  state: string
  language: string
  birthday: string
  mood: string
  assessmentType?: "objective" | "subjective"
  scores?: {
    depression: number
    anxiety: number
    total: number
  }
  onboardingComplete: boolean
}

export default function HomePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    const storedProfile = localStorage.getItem("userProfile")
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile))
    } else {
      // Redirect to onboarding if no profile found
      window.location.href = "/"
    }
  }, [])

  const clearProfile = () => {
    localStorage.removeItem("userProfile")
    window.location.href = "/"
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Loading...</h1>
          <p className="text-muted-foreground">Setting up your dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-balance">Welcome back, {profile.nickname || profile.name}! 👋</h1>
          <p className="text-muted-foreground mt-2">Here's your personalized mental wellbeing dashboard</p>
        </div>

        {/* Live with Mitra quick entry */}
        <div className="flex justify-center">
          <a
            href="/live"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
          >
            <span>Go Live with Mitra (Mock)</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                <strong>Name:</strong> {profile.name}
              </p>
              <p>
                <strong>Nickname:</strong> {profile.nickname}
              </p>
              <p>
                <strong>Location:</strong> {profile.state}
              </p>
              <p>
                <strong>Language:</strong> {profile.language}
              </p>
              <p>
                <strong>Current Mood:</strong> {profile.mood}
              </p>
            </CardContent>
          </Card>

          {profile.scores && (
            <Card>
              <CardHeader>
                <CardTitle>Assessment Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <strong>Depression Score:</strong> {profile.scores.depression}/6
                </p>
                <p>
                  <strong>Anxiety Score:</strong> {profile.scores.anxiety}/6
                </p>
                <p>
                  <strong>Total Score:</strong> {profile.scores.total}/18
                </p>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Remember: These scores are for informational purposes only. Consult a healthcare professional for
                    proper evaluation.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="text-center">
          <Button variant="outline" onClick={clearProfile}>
            Reset Onboarding
          </Button>
        </div>
      </div>
    </div>
  )
}
