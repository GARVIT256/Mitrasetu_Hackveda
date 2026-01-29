import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Users, TrendingUp, Flame, Sparkles, ChevronRight, Star, Calendar, Award } from 'lucide-react';
import {useNavigate} from 'react-router-dom';

export const MentalHealthHome = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [streak, setStreak] = useState(7);
  const [mascotMessage, setMascotMessage] = useState('');
  const [showMascotMessage, setShowMascotMessage] = useState(false);
  const [mascotPosition, setMascotPosition] = useState({ x: 15, y: 25 });
  const [isMoving, setIsMoving] = useState(false);
  const [mascotTarget, setMascotTarget] = useState({ x: 15, y: 25 });
  const [notifications, setNotifications] = useState(3);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hoveredCard, setHoveredCard] = useState(null);

  const navigate=useNavigate(); 

  const moods = [
    { emoji: '😊', label: 'Excellent', color: 'bg-green-500', shadow: 'shadow-green-200' },
    { emoji: '🙂', label: 'Good', color: 'bg-blue-500', shadow: 'shadow-blue-200' },
    { emoji: '😐', label: 'Okay', color: 'bg-yellow-500', shadow: 'shadow-yellow-200' },
    { emoji: '😔', label: 'Low', color: 'bg-purple-500', shadow: 'shadow-purple-200' },
    { emoji: '😢', label: 'Struggling', color: 'bg-red-500', shadow: 'shadow-red-200' }
  ];

  const supportiveMessages = [
    "Taking care of yourself is important! 🌸",
    "You're making progress, step by step 🌱",
    "Remember to breathe deeply today 🫧",
    "Small victories count too! ⭐",
    "You're not alone in this journey 💚",
    "Every day is a new beginning 🌅"
  ];

  const moodData = [
    { day: 'Mon', mood: 10, color: 'bg-blue-400' },
    { day: 'Tue', mood: 7, color: 'bg-green-400' },
    { day: 'Wed', mood: 4, color: 'bg-yellow-400' },
    { day: 'Thu', mood: 8, color: 'bg-green-500' },
    { day: 'Fri', mood: 6, color: 'bg-blue-400' },
    { day: 'Sat', mood: 9, color: 'bg-green-500' },
    { day: 'Sun', mood: 7, color: 'bg-blue-500' }
  ];

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Totoro-like movement: stop and go
  useEffect(() => {
    const moveToTarget = () => {
      if (isMoving) {
        setMascotPosition(prev => {
          const dx = mascotTarget.x - prev.x;
          const dy = mascotTarget.y - prev.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 2) {
            setIsMoving(false);
            // Stop for a random time (2-5 seconds)
            setTimeout(() => {
              const newTarget = {
                x: Math.random() * 80 + 10,
                y: Math.random() * 70 + 15
              };
              setMascotTarget(newTarget);
              setIsMoving(true);
            }, Math.random() * 3000 + 2000);
            return mascotTarget;
          }
          
          const speed = 0.8;
          return {
            x: prev.x + (dx / distance) * speed,
            y: prev.y + (dy / distance) * speed
          };
        });
      }
    };

    const interval = setInterval(moveToTarget, 50);
    return () => clearInterval(interval);
  }, [isMoving, mascotTarget]);

  // Start initial movement
  useEffect(() => {
    setTimeout(() => {
      setMascotTarget({ x: 70, y: 60 });
      setIsMoving(true);
    }, 3000);
  }, []);

  // Random supportive messages
  useEffect(() => {
    const showMessage = () => {
      if (Math.random() > 0.7) { // 30% chance
        const message = supportiveMessages[Math.floor(Math.random() * supportiveMessages.length)];
        setMascotMessage(message);
        setShowMascotMessage(true);
        
        setTimeout(() => {
          setShowMascotMessage(false);
        }, 4000);
      }
    };

    const messageInterval = setInterval(showMessage, 10000);
    return () => clearInterval(messageInterval);
  }, []);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    setMascotMessage(`Great choice! ${mood.emoji} Keep it up!`);
    setShowMascotMessage(true);
    setTimeout(() => setShowMascotMessage(false), 3000);
  };

  const handleChatClick = (type) => {
    setNotifications(notifications > 0 ? notifications - 1 : 0);
    // Add realistic interaction feedback
    console.log(`Opening ${type} chat...`);
  };

  // Totoro-like mascot component
  const TotoroMascot = () => (
    <div 
      className="fixed z-50 transition-all duration-200 ease-out"
      style={{ 
        left: `${mascotPosition.x}%`, 
        top: `${mascotPosition.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="relative">
        {/* Totoro body */}
        <div className={`relative transition-all duration-300 ${isMoving ? 'animate-bounce' : ''}`}>
          {/* Main body */}
          <div className="relative h-16 bg-gray-600 rounded-full shadow-lg w-14">
            {/* Belly */}
            <div className="absolute bg-gray-100 rounded-full inset-x-2 bottom-2 top-4"></div>
            {/* Belly pattern */}
            <div className="absolute flex flex-col space-y-1 inset-x-3 bottom-3 top-6">
              <div className="w-2 h-2 mx-auto bg-gray-400 rounded-full"></div>
              <div className="w-3 h-1 mx-auto bg-gray-400 rounded-full"></div>
              <div className="w-2 h-1 mx-auto bg-gray-400 rounded-full"></div>
            </div>
            
            {/* Ears */}
            <div className="absolute w-3 h-4 transform bg-gray-600 rounded-full -top-2 left-2 -rotate-12"></div>
            <div className="absolute w-3 h-4 transform bg-gray-600 rounded-full -top-2 right-2 rotate-12"></div>
            
            {/* Eyes */}
            <div className="absolute w-2 h-2 bg-black rounded-full top-2 left-3"></div>
            <div className="absolute w-2 h-2 bg-black rounded-full top-2 right-3"></div>
            
            {/* Nose */}
            <div className="absolute w-1 h-1 transform -translate-x-1/2 bg-black rounded-full top-4 left-1/2"></div>
            
            {/* Arms */}
            <div className="absolute w-3 h-4 bg-gray-600 rounded-full top-6 -left-2"></div>
            <div className="absolute w-3 h-4 bg-gray-600 rounded-full top-6 -right-2"></div>
          </div>
          
          {/* Shadow */}
          <div className="absolute w-12 h-3 transform -translate-x-1/2 bg-gray-300 rounded-full opacity-50 -bottom-1 left-1/2 blur-sm"></div>
        </div>
        
        {/* Message bubble */}
        {showMascotMessage && (
          <div className="absolute z-10 transform -translate-x-1/2 -top-20 left-1/2 animate-fade-in">
            <div className="px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 shadow-xl rounded-2xl whitespace-nowrap max-w-48">
              {mascotMessage}
              <div className="absolute w-0 h-0 transform -translate-x-1/2 border-l-4 border-r-4 border-transparent top-full left-1/2 border-t-6 border-t-white"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="px-6 py-4 mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">MindSpace</h1>
              <p className="text-sm text-gray-600">{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full">
                  <span className="text-sm font-semibold text-white">{currentTime.getHours()}:{currentTime.getMinutes().toString().padStart(2, '0')}</span>
                </div>
                {notifications > 0 && (
                  <div className="absolute flex items-center justify-center w-5 h-5 bg-red-500 rounded-full -top-1 -right-1">
                    <span className="text-xs font-bold text-white">{notifications}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Totoro Mascot */}
      <TotoroMascot />

      {/* Main Content */}
      <div className="px-6 py-8 mx-auto max-w-7xl">
        {/* Welcome Section */}
        <div className="relative p-8 mb-8 overflow-hidden text-white bg-gradient-to-r from-purple-500 to-blue-600 rounded-3xl">
          <div className="relative z-10">
            <h2 className="mb-2 text-3xl font-bold">Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'}! 👋</h2>
            <p className="mb-4 text-lg text-purple-100">How are you feeling today? Your mental health journey matters.</p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-orange-300" />
                <span className="font-semibold">{streak} day streak!</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-300" />
                <span>Level 3 Mindful</span>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 translate-x-8 -translate-y-8 bg-white rounded-full opacity-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 -translate-x-8 translate-y-8 bg-white rounded-full opacity-10"></div>
        </div>

        {/* Today's Mood Selection */}
        <div className="p-6 mb-8 bg-white border border-gray-100 shadow-lg rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="flex items-center text-xl font-semibold text-gray-800">
              <Calendar className="w-6 h-6 mr-2 text-blue-500" />
              Today's Check-in
            </h3>
            <span className="text-sm text-gray-500">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          
          <div className="grid grid-cols-5 gap-4">
            {moods.map((mood, index) => (
              <button
                key={index}
                onClick={() => handleMoodSelect(mood)}
                className={`group relative p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                  selectedMood?.label === mood.label 
                    ? `${mood.color} border-transparent text-white shadow-lg ${mood.shadow}` 
                    : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="mb-2 text-3xl transition-transform group-hover:scale-110">{mood.emoji}</div>
                <div className={`text-sm font-medium ${selectedMood?.label === mood.label ? 'text-white' : 'text-gray-700'}`}>
                  {mood.label}
                </div>
                {selectedMood?.label === mood.label && (
                  <div className="absolute flex items-center justify-center w-6 h-6 bg-white rounded-full -top-1 -right-1">
                    <div className="flex items-center justify-center w-4 h-4 bg-green-500 rounded-full">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Chat Options */}
        <div className="grid gap-6 mb-8 md:grid-cols-3">
 <div
      className="p-6 transition-all duration-300 bg-white border border-gray-100 shadow-lg cursor-pointer group rounded-2xl hover:shadow-xl hover:-translate-y-1"
      onClick={() => navigate("/journey")}
      onMouseEnter={() => setHoveredCard("ai")}
      onMouseLeave={() => setHoveredCard(null)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <ChevronRight
          className={`w-5 h-5 text-gray-400 transition-transform ${
            hoveredCard === "ai" ? "translate-x-1" : ""
          }`}
        />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-800">
        AI Assistant
      </h3>
      <p className="mb-4 text-sm text-gray-600">
        Available 24/7 for support and guidance
      </p>
      <div className="flex items-center justify-between">
        <span className="px-2 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-full">
          Online
        </span>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      </div>
    </div>

    <div
      className="p-6 transition-all duration-300 bg-white border border-gray-100 shadow-lg cursor-pointer group rounded-2xl hover:shadow-xl hover:-translate-y-1"
      onClick={() => navigate("/resources")}
      onMouseEnter={() => setHoveredCard("peer")}
      onMouseLeave={() => setHoveredCard(null)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
          <Users className="w-6 h-6 text-white" />
        </div>
        <ChevronRight
          className={`w-5 h-5 text-gray-400 transition-transform ${
            hoveredCard === "peer" ? "translate-x-1" : ""
          }`}
        />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-800">
        Peer Support
      </h3>
      <p className="mb-4 text-sm text-gray-600">
        Connect with others on similar journeys
      </p>
      <div className="flex items-center justify-between">
        <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
          127 online
        </span>
        <div className="flex -space-x-1">
          <div className="w-6 h-6 bg-purple-400 border-2 border-white rounded-full"></div>
          <div className="w-6 h-6 bg-pink-400 border-2 border-white rounded-full"></div>
          <div className="w-6 h-6 bg-blue-400 border-2 border-white rounded-full"></div>
        </div>
      </div>
    </div>


          <div 
            className="p-6 transition-all duration-300 bg-white border border-gray-100 shadow-lg cursor-pointer group rounded-2xl hover:shadow-xl hover:-translate-y-1"
            onClick={() => handleChatClick('Mentor')}
            onMouseEnter={() => setHoveredCard('mentor')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${hoveredCard === 'mentor' ? 'translate-x-1' : ''}`} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800">Professional Mentor</h3>
            <p className="mb-4 text-sm text-gray-600">Licensed therapists and counselors</p>
            <div className="flex items-center justify-between">
              <span className="px-2 py-1 text-xs font-medium text-purple-600 bg-purple-100 rounded-full">Next: 2:30 PM</span>
              <Award className="w-4 h-4 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Progress Dashboard */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Mood Graph */}
          <div className="p-6 bg-white border border-gray-100 shadow-lg rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center text-lg font-semibold text-gray-800">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                Weekly Progress
              </h3>
              <span className="text-sm text-gray-500">Last 7 days</span>
            </div>
            
            <div className="flex items-end justify-between h-40 mb-4">
              {moodData.map((day, index) => (
                <div key={index} className="flex flex-col items-center group">
                  <div className="relative mb-2">
                    <div 
                      className={`w-8 ${day.color} rounded-t-lg transition-all duration-1000 ease-out shadow-sm group-hover:shadow-md cursor-pointer`}
                      style={{ 
                        height: `${day.mood * 14}px`,
                        animationDelay: `${index * 150}ms`
                      }}
                    ></div>
                    <div className="absolute px-2 py-1 text-xs text-white transition-opacity transform -translate-x-1/2 bg-gray-800 rounded opacity-0 -top-8 left-1/2 group-hover:opacity-100">
                      {day.mood}/10
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-600">{day.day}</span>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Great</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Good</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Okay</span>
              </div>
            </div>
          </div>

          {/* Streak & Achievements */}
          <div className="p-6 bg-white border border-gray-100 shadow-lg rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center text-lg font-semibold text-gray-800">
                <Flame className="w-5 h-5 mr-2 text-orange-500" />
                Achievements
              </h3>
            </div>
            
            {/* Streak Display */}
            <div className="mb-6 text-center">
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full shadow-lg bg-gradient-to-r from-orange-400 to-red-500">
                <span className="text-2xl font-bold text-white">{streak}</span>
                <div className="absolute rounded-full -inset-1 bg-gradient-to-r from-orange-400 to-red-500 opacity-20 animate-pulse"></div>
              </div>
              <p className="mt-2 text-sm text-gray-600">Day streak! Keep it up! 🔥</p>
            </div>

            {/* Recent Achievements */}
            <div className="space-y-3">
              <div className="flex items-center p-3 space-x-3 bg-blue-50 rounded-xl">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Week Warrior</p>
                  <p className="text-xs text-gray-600">7 days of consistent check-ins</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 space-x-3 bg-green-50 rounded-xl">
                <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Self-Care Champion</p>
                  <p className="text-xs text-gray-600">Completed mindfulness exercise</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

  <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translate(-50%, -70%) scale(0.8); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MentalHealthHome;