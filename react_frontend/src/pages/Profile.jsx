
import { ArrowLeft, Calendar, Users, MessageCircle, Star, Award, Heart, Frown, Smile } from "lucide-react"
import { Nav } from '../components/nav'
import { useState, useEffect } from 'react'

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user profile from localStorage
    const savedProfile = localStorage.getItem('userProfile')
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile))
      } catch (error) {
        console.error('Error parsing user profile:', error)
      }
    }
    setLoading(false)
  }, [])

  // Calculate age from birthday
  const calculateAge = (birthday) => {
    if (!birthday) return null
    const today = new Date()
    const birthDate = new Date(birthday)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Format birthday for display
  const formatBirthday = (birthday) => {
    if (!birthday) return null
    const date = new Date(birthday)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Get mood display info
  const getMoodInfo = (moodValue) => {
    const moodOptions = [
      { emoji: "😄", label: "Excellent", value: "excellent", color: "from-green-400 to-emerald-500" },
      { emoji: "😊", label: "Good", value: "good", color: "from-blue-400 to-cyan-500" },
      { emoji: "😐", label: "Okay", value: "okay", color: "from-yellow-400 to-orange-500" },
      { emoji: "😔", label: "Not Great", value: "not-great", color: "from-orange-400 to-red-500" },
      { emoji: "😰", label: "Struggling", value: "struggling", color: "from-red-400 to-pink-500" },
    ]
    return moodOptions.find(m => m.value === moodValue) || moodOptions[1]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50">
        <Nav />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-lg text-purple-600">Loading profile...</div>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50">
        <Nav />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="mb-4 text-lg text-purple-600">No profile found</div>
            <div className="text-sm text-purple-500">Please complete the onboarding process first</div>
          </div>
        </div>
      </div>
    )
  }

  const currentMood = userProfile.mood ? getMoodInfo(userProfile.mood).label : "Not Set"

  const getMoodIcon = (moodValue) => {
    const moodInfo = getMoodInfo(moodValue)
    switch (moodValue) {
      case "excellent":
        return <Smile className="w-5 h-5 text-green-500" />;
      case "good":
        return <Smile className="w-5 h-5 text-blue-500" />;
      case "okay":
        return <Heart className="w-5 h-5 text-yellow-500" />;
      case "not-great":
        return <Frown className="w-5 h-5 text-orange-500" />;
      case "struggling":
        return <Frown className="w-5 h-5 text-red-500" />;
      default:
        return <Smile className="w-5 h-5 text-green-500" />;
    }
  };

  const getMoodColor = (moodValue) => {
    switch (moodValue) {
      case "excellent":
        return "text-green-600 bg-green-50 border-green-200";
      case "good":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "okay":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "not-great":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "struggling":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-green-600 bg-green-50 border-green-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50">
      <Nav />
      <div className="w-full max-w-5xl px-4 pt-24 pb-8 mx-auto">
        {/* Profile Info */}
        <div className="mb-6 border border-purple-200 shadow rounded-xl bg-white/80">
          <div className="p-6">
            <div className="flex flex-row items-center justify-between gap-6 mb-4">
              {/* Avatar and Info */}
              <div className="flex flex-row items-center flex-1 min-w-0 gap-4">
                <div className="flex items-center justify-center w-16 h-16 overflow-hidden bg-purple-100 border-2 border-purple-300 rounded-full shrink-0">
                  <img src="Profile.png" alt="Profile" className="object-cover w-full h-full rounded-full" />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                      <h1 className="text-2xl font-bold leading-tight text-left text-purple-900 truncate">
                        {userProfile.name || 'User'}
                      </h1>
                      <p className="leading-tight text-left text-purple-600 truncate">
                        {userProfile.state || 'Location not set'}
                      </p>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-sm text-purple-600">Nickname:</span>
                    <span className="text-purple-700 border border-purple-300 rounded px-2 py-0.5 text-xs">
                      {userProfile.nickname || 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
              {/* Chat Button */}
              <div className="flex items-center h-full">
                <button
                  className="flex items-center px-4 py-2 text-purple-700 transition-colors bg-transparent border border-purple-300 rounded hover:bg-purple-50"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Chat
                </button>
              </div>
            </div>
            {/* Current Mood */}
            <div className="mb-4">
              <div
                className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full border ${getMoodColor(userProfile.mood)}`}
              >
                {getMoodIcon(userProfile.mood)}
                <span className="text-sm font-medium">Current mood: {currentMood}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Profile Stats */}
        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 md:grid-cols-3">
          <div className="p-4 text-center transition-colors border border-purple-200 shadow hover:border-purple-300 rounded-xl bg-white/80">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <div className="text-lg font-semibold text-purple-900">
              {formatBirthday(userProfile.birthday) || 'Not set'}
            </div>
            <div className="text-sm text-purple-600">Birthdate</div>
          </div>
          <div className="p-4 text-center transition-colors border border-purple-200 shadow hover:border-purple-300 rounded-xl bg-white/80">
            <div className="flex items-center justify-center w-6 h-6 mx-auto mb-2 text-purple-600">
              {userProfile.gender === 'Male' ? '♂' : userProfile.gender === 'Female' ? '♀' : '🧑'}
            </div>
            <div className="text-lg font-semibold text-purple-900">
              {userProfile.gender || 'Not set'}
            </div>
            <div className="text-sm text-purple-600">Gender</div>
          </div>
          <div className="p-4 text-center transition-colors border border-purple-200 shadow hover:border-purple-300 rounded-xl bg-white/80">
            <Users className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <div className="text-lg font-semibold text-purple-900">
              {calculateAge(userProfile.birthday) || 'N/A'}
            </div>
            <div className="text-sm text-purple-600">Age</div>
          </div>
        </div>
        {/* Badges Section */}
        <div className="flex items-center justify-between p-4 mb-4 border border-purple-200 shadow rounded-xl bg-white/80">
          <div className="flex items-center space-x-3">
            <Star className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-900">Communication Champion</span>
          </div>
          <span className="px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded hover:bg-purple-200">Level 3</span>
        </div>
        <div className="flex items-center justify-between p-4 mb-4 border border-purple-200 shadow rounded-xl bg-white/80">
          <div className="flex items-center space-x-3">
            <Award className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-900">Cultural Bridge Builder</span>
          </div>
          <span className="px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded hover:bg-purple-200">Expert</span>
        </div>
        <div className="flex items-center justify-between p-4 border border-purple-200 shadow rounded-xl bg-white/80">
          <div className="flex items-center space-x-3">
            <Heart className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-900">Empathy Ambassador</span>
          </div>
          <span className="px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded hover:bg-purple-200">Rising Star</span>
        </div>

        {/* Assessment Results Section */}
        {userProfile.assessmentType && (
          <div className="p-6 mt-6 border border-purple-200 shadow rounded-xl bg-white/80">
            <h3 className="flex items-center mb-4 text-xl font-semibold text-purple-900">
              <span className="mr-2">📊</span>
              Assessment Results
            </h3>
            
            {userProfile.assessmentType === 'objective' && userProfile.scores && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="text-sm font-medium text-blue-600">Depression Score</div>
                    <div className="text-2xl font-bold text-blue-800">
                      {userProfile.scores.depression}/6
                    </div>
                    <div className="text-xs text-blue-600">
                      {userProfile.scores.depression <= 1 ? 'Minimal' : 
                       userProfile.scores.depression <= 3 ? 'Mild' : 
                       userProfile.scores.depression <= 5 ? 'Moderate' : 'Severe'}
                    </div>
                  </div>
                  <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <div className="text-sm font-medium text-green-600">Anxiety Score</div>
                    <div className="text-2xl font-bold text-green-800">
                      {userProfile.scores.anxiety}/6
                    </div>
                    <div className="text-xs text-green-600">
                      {userProfile.scores.anxiety <= 1 ? 'Minimal' : 
                       userProfile.scores.anxiety <= 3 ? 'Mild' : 
                       userProfile.scores.anxiety <= 5 ? 'Moderate' : 'Severe'}
                    </div>
                  </div>
                  <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                    <div className="text-sm font-medium text-purple-600">Overall Score</div>
                    <div className="text-2xl font-bold text-purple-800">
                      {userProfile.scores.total}/18
                    </div>
                    <div className="text-xs text-purple-600">
                      {userProfile.scores.total <= 4 ? 'Minimal' : 
                       userProfile.scores.total <= 9 ? 'Mild' : 
                       userProfile.scores.total <= 14 ? 'Moderate' : 'Severe'}
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
                  <div className="text-sm text-amber-800">
                    <strong>Note:</strong> This assessment is for informational purposes only and should not be used for diagnosis. 
                    Please consult with a healthcare professional for proper evaluation and treatment.
                  </div>
                </div>
              </div>
            )}

            {userProfile.assessmentType === 'subjective' && userProfile.subjectiveAnswers && (
              <div className="space-y-4">
                <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                  <div className="text-sm text-green-800">
                    <strong>Reflection Summary:</strong> You completed a subjective assessment with {userProfile.subjectiveAnswers.length} thoughtful responses. 
                    These insights help us provide personalized support tailored to your unique journey.
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
                  <div className="text-sm text-amber-800">
                    <strong>Note:</strong> This assessment is for informational purposes only and should not be used for diagnosis. 
                    Please consult with a healthcare professional for proper evaluation and treatment.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Language Preference */}
        {userProfile.language && (
          <div className="p-4 mt-6 border border-purple-200 shadow rounded-xl bg-white/80">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🌐</span>
              <div>
                <div className="font-medium text-purple-900">Preferred Language</div>
                <div className="text-sm text-purple-600">{userProfile.language}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
