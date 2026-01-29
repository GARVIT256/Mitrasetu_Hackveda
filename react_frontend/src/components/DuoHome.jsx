import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Nav } from './nav'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Users, Heart, ChevronRight, Calendar, TrendingUp, Flame, Star, ThumbsUp } from 'lucide-react'
import { Twemoji } from './Twemoji'

// Light palette
const colors = {
  bg: 'bg-white',
  text: 'text-gray-900',
  sub: 'text-gray-600',
  card: 'bg-white',
  border: 'border-gray-200',
  grad: 'bg-gradient-to-r from-[#A258FF] via-[#FF62C0] to-[#2EA8FF]'
}

// no sidebar here; global sidebar is rendered from nav.jsx on /home

export default function DuoHome() {
  const navigate = useNavigate()
  const [selectedMood, setSelectedMood] = useState(null)
  const [streak, setStreak] = useState(7)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [hoveredCard, setHoveredCard] = useState(null)
  const stories = [
    'A penguin walked into therapy and said: "I feel very ice-olated." The therapist smiled and said, "Let\'s warm up with a breath and talk about what\'s beneath the surface." The penguin nodded, realizing even the coldest days can soften with kindness. Later that evening, the penguin practiced a single mindful breath before speaking to a friend, noticing how warmth can start in the smallest of places and ripple outwards.',
    'Your future self is already proud you showed up today. Imagine them sending you a note: "Thank you for choosing one kind action for us. Keep going, slowly and gently—this is how we change our lives." That future you remembers this very moment as a turning point, when you chose care over pressure and presence over perfection.',
    'Two neurons met at a synapse. One said: "I feel a connection." The other replied, "Let\'s practice it daily." Our brains grow with small, repeated moments—one deep breath, one kind word, one more try. With time, the path between them widened into a road, then a sturdy bridge, making calm more accessible with each practice.',
    'Tiny steps are still steps. A tortoise once whispered to a mountain: "I\'ll meet you at the top." The mountain didn\'t move—but the tortoise did, one calm step at a time. Seasons passed, and though the peak felt distant, the tortoise discovered wildflowers, shelter, and friends along the path—the journey becoming its own soft reward.'
  ]
  const jokes = [
    'Why did the scarecrow become a great mentor? He was outstanding in his field. He also offered excellent boundary-setting advice—turns out, standing your ground is a valuable life skill.',
    'Parallel lines have so much in common. It’s a shame they’ll never meet. Still, they cheer each other on from a respectful distance—healthy relationships 101.',
    'I used to play piano by ear, now I use my hands. My neighbors appreciate the upgrade, and my fingers say the ergonomics are a lot better too.',
    'I told my therapist I keep dreaming of a muffler. She said I’m exhausted. We agreed I\'d take a nap and check my emissions—less noise, more rest.'
  ]
  const affirmations = [
    'I am allowed to move at my own pace, without comparing my path to anyone else\'s. I honor what my body and mind need, trusting that gentle consistency leads me exactly where I\'m meant to be.',
    'My feelings are valid, and I can hold them with kindness. I am learning to listen to myself with patience, compassion, and care, even when my emotions feel complex or heavy.',
    'Small actions today create big changes over time. I celebrate each step—no matter how tiny—as a meaningful investment in my well-being and future self.',
    'I choose progress over perfection. I release pressure to get everything right and focus instead on showing up with honesty, curiosity, and heart.'
  ]
  const [storyIdx, setStoryIdx] = useState(0)
  const [jokeIdx, setJokeIdx] = useState(0)
  const [affirmIdx, setAffirmIdx] = useState(0)
  // Floating mascot
  const mascotImage = '/MitraSetu-Mascot.jpg'
  const [position, setPosition] = useState({ x: 200, y: 300 })
  const [isFloating, setIsFloating] = useState(true)
  const [showMessage, setShowMessage] = useState(false)
  const floatMessages = [
    { emoji: <Twemoji>🌿</Twemoji>, message: 'Every step counts on your wellness journey!' },
    { emoji: <Twemoji>💫</Twemoji>, message: 'Progress over perfection. You are doing great.' },
    { emoji: <Twemoji>✨</Twemoji>, message: 'One kind breath can change the moment.' },
  ]
  const [msgIdx, setMsgIdx] = useState(0)
  const currentMessage = floatMessages[msgIdx]

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const s = setInterval(() => setStoryIdx((i) => (i + 1) % stories.length), 1000000)
    const j = setInterval(() => setJokeIdx((i) => (i + 1) % jokes.length), 1000000)
    const a = setInterval(() => setAffirmIdx((i) => (i + 1) % affirmations.length), 1000000)
    return () => { clearInterval(s); clearInterval(j); clearInterval(a) }
  }, [])

  // Random gentle movement for mascot
  useEffect(() => {
    const id = setInterval(() => {
      setPosition((prev) => ({
        x: Math.max(40, Math.min(window.innerWidth - 140, prev.x + (Math.random() * 200 - 100))),
        y: Math.max(120, Math.min(window.innerHeight - 140, prev.y + (Math.random() * 160 - 80)))
      }))
    }, 4000)
    return () => clearInterval(id)
  }, [])

  const handleMascotClick = () => {
    setShowMessage(true)
    setMsgIdx((i) => (i + 1) % floatMessages.length)
    setTimeout(() => setShowMessage(false), 3500)
  }

  const moods = [
    { emoji: '😊', label: 'Excellent', color: 'bg-emerald-500' },
    { emoji: '🙂', label: 'Good', color: 'bg-blue-500' },
    { emoji: '😐', label: 'Okay', color: 'bg-yellow-500' },
    { emoji: '😔', label: 'Low', color: 'bg-purple-500' },
    { emoji: '😢', label: 'Struggling', color: 'bg-rose-500' }
  ]
  console.log('Moods array:', moods);
  const moodData = [
    { day: 'Mon', mood: 10, color: 'bg-blue-400' },
    { day: 'Tue', mood: 7, color: 'bg-emerald-400' },
    { day: 'Wed', mood: 4, color: 'bg-yellow-400' },
    { day: 'Thu', mood: 8, color: 'bg-emerald-500' },
    { day: 'Fri', mood: 6, color: 'bg-blue-400' },
    { day: 'Sat', mood: 9, color: 'bg-emerald-500' },
    { day: 'Sun', mood: 7, color: 'bg-blue-500' }
  ]

  // simple local feed state
  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem('mitrasetu_posts')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  // likes state persisted per card id
  const [likes, setLikes] = useState(() => {
    try {
      const saved = localStorage.getItem('mitrasetu_likes')
      return saved ? JSON.parse(saved) : {}
    } catch { return {} }
  })

  const toggleLike = (id) => {
    setLikes((prev) => {
      const current = prev[id] || { liked: false, count: 0 }
      const nextState = {
        ...prev,
        [id]: {
          liked: !current.liked,
          count: Math.max(0, current.count + (!current.liked ? 1 : -1))
        }
      }
      localStorage.setItem('mitrasetu_likes', JSON.stringify(nextState))
      return nextState
    })
  }

  // comments state persisted per card id
  const [comments, setComments] = useState(() => {
    try {
      const saved = localStorage.getItem('mitrasetu_comments')
      return saved ? JSON.parse(saved) : {}
    } catch { return {} }
  })

  const addComment = (id, text) => {
    setComments((prev) => {
      const current = prev[id] || []
      const nextState = { ...prev, [id]: [{ id: Date.now(), text }, ...current] }
      localStorage.setItem('mitrasetu_comments', JSON.stringify(nextState))
      return nextState
    })
  }

  const addPost = (text) => {
    const newPost = { id: Date.now(), text }
    const next = [newPost, ...posts]
    setPosts(next)
    localStorage.setItem('mitrasetu_posts', JSON.stringify(next))
  }

  return (
    <div className={`${colors.bg} ${colors.text} min-h-screen`}>
      <Nav />
      <main className="px-6 pt-6 mx-auto md:pl-64 max-w-7xl relative">
        <DashboardMascotOverlay position={position} setPosition={setPosition} isFloating={isFloating} showMessage={showMessage} currentMessage={currentMessage} handleMascotClick={handleMascotClick} mascotImage={mascotImage} />
        <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_300px] gap-5">
          {/* Center content - all features from MentalHealthHome with new skin */}
          <section className={`rounded-2xl ${colors.card} border ${colors.border} p-6 relative overflow-hidden z-[59]`}>
            {/* Mascot image floating in the background */}
            <img src="/mascot.png" alt="MitraSetu mascot" className="absolute hidden w-64 pointer-events-none select-none md:block -right-16 -top-20 opacity-10" />

            {/* Welcome strip (Duolingo-like pill) */}
            <div className="mb-6 flex flex-col items-center">
              <div
                className="inline-flex items-center gap-3 px-6 py-2 rounded-full shadow-xl bg-gradient-to-r from-[#A258FF] via-[#FF62C0] to-[#2EA8FF]"
                style={{ boxShadow: '0 0 32px 0 #A258FF55, 0 0 16px 0 #2EA8FF33' }}
              >
                <span className="text-4xl font-extrabold text-white drop-shadow-lg tracking-tight">
                  Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'}!
                </span>
                <span className="text-3xl"><Twemoji>👋</Twemoji></span>
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-gray-900">How are you feeling today?</h2>
            </div>

            {/* Today's check-in (moods) */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><Calendar size={18} className="text-[#7FB3FF]" /><span className="font-semibold">Today's Check-in</span></div>
                <span className={`text-sm ${colors.sub}`}>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {/* DEBUG: Show selected mood */}
              <div className="mb-2 text-center">
                <span className="text-lg font-bold text-indigo-600">{selectedMood ? `Selected: ` : 'No mood selected'}{selectedMood && <Twemoji>{selectedMood.emoji}</Twemoji>} {selectedMood?.label}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {moods.map((m, i) => {
                  const isSelected = selectedMood?.label === m.label;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        console.log('Mood selected:', m.label);
                        setSelectedMood(m);
                      }}
                      className={`group relative p-4 rounded-xl border transition 
                        ${isSelected ? `${m.color} text-white border-2 border-indigo-500` : `${colors.card} ${colors.border} hover:bg-[#161C28]`} 
                      `}
                      style={isSelected ? { boxShadow: '0 0 0 2px #6366f1, 0 2px 8px #6366f133' } : {}}
                    >
                      <div className="mb-1 text-2xl"><Twemoji>{m.emoji}</Twemoji></div>
                      <div className={`text-xs ${isSelected ? 'text-white' : colors.sub}`}>{m.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Instagram-like post feed */}
            <div id="post-tip" className="mb-6 space-y-6">
              <PostComposer onPost={addPost} />
              {posts.map(p => (
                <FeedCard
                  key={p.id}
                  id={`post-${p.id}`}
                  title="Community Tip"
                  content={p.text}
                  like={likes[`post-${p.id}`]}
                  onToggleLike={() => toggleLike(`post-${p.id}`)}
                  comments={comments[`post-${p.id}`] || []}
                  onAddComment={(text) => addComment(`post-${p.id}`, text)}
                />
              ))}
              <FeedCard
                id={`affirmation-${affirmIdx}`}
                title="Daily Affirmation"
                content={affirmations[affirmIdx]}
                like={likes[`affirmation-${affirmIdx}`]}
                onToggleLike={() => toggleLike(`affirmation-${affirmIdx}`)}
                comments={comments[`affirmation-${affirmIdx}`] || []}
                onAddComment={(text) => addComment(`affirmation-${affirmIdx}`, text)}
              />
              <FeedCard
                id={`joke-${jokeIdx}`}
                title="Daily Joke"
                content={jokes[jokeIdx]}
                like={likes[`joke-${jokeIdx}`]}
                onToggleLike={() => toggleLike(`joke-${jokeIdx}`)}
                comments={comments[`joke-${jokeIdx}`] || []}
                onAddComment={(text) => addComment(`joke-${jokeIdx}`, text)}
              />
              <FeedCard
                id={`story-${storyIdx}`}
                title="Daily Story"
                content={stories[storyIdx]}
                like={likes[`story-${storyIdx}`]}
                onToggleLike={() => toggleLike(`story-${storyIdx}`)}
                comments={comments[`story-${storyIdx}`] || []}
                onAddComment={(text) => addComment(`story-${storyIdx}`, text)}
              />
            </div>

            {/* Progress moved to right rail */}
          </section>

          {/* Right rail: Weekly Progress + Achievements + Coins */}
          <aside className={`rounded-2xl ${colors.card} h-fit sticky top-6 space-y-4`}> 
            <div className={`p-5 rounded-2xl border ${colors.border} ${colors.card}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"><TrendingUp size={18} className="text-[#7FB3FF]" /><span className="font-semibold">Weekly Progress</span></div>
                <span className={`text-sm ${colors.sub}`}>Last 7 days</span>
              </div>
              <div className="grid items-end h-40 grid-cols-7 gap-2">
                {moodData.map((d, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`w-6 ${d.color} rounded-t`} style={{ height: `${d.mood * 10}px` }}></div>
                    <span className={`text-[10px] mt-1 ${colors.sub}`}>{d.day}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={`p-5 rounded-2xl border ${colors.border} ${colors.card}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"><Flame size={18} className="text-orange-400" /><span className="font-semibold">Achievements</span></div>
              </div>
              <div className="mb-4 text-center">
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full shadow-lg bg-gradient-to-r from-orange-400 to-red-500">
                  <span className="text-2xl font-bold text-white">{streak}</span>
                  <div className="absolute rounded-full -inset-1 bg-gradient-to-r from-orange-400 to-red-500 opacity-20 animate-pulse"></div>
                </div>
                <p className={`text-sm mt-2 ${colors.sub}`}>Day streak! Keep it up! 🔥</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full"><Star size={16} className="text-white" /></div>
                  <div>
                    <div className="text-sm font-medium">Week Warrior</div>
                    <div className={`text-xs ${colors.sub}`}>7 days of consistent check-ins</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500"><Heart size={16} className="text-white" /></div>
                  <div>
                    <div className="text-sm font-medium">Self-Care Champion</div>
                    <div className={`text-xs ${colors.sub}`}>Completed mindfulness exercise</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border ${colors.border} ${colors.card}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">Coins</div>
                <span className="text-xs text-gray-500">Today</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400 rounded-full" />
                <div>
                  <div className="text-xl font-bold">500</div>
                  <div className="text-xs text-gray-500">Keep collecting by completing tips</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

// Instagram-like feed components
function FeedCard({ id, title, content, like, onToggleLike, comments = [], onAddComment }) {
  const liked = like?.liked || false
  const likeCount = like?.count || 0
  const [commentText, setCommentText] = React.useState('')
  const handleAddComment = () => {
    const text = commentText.trim()
    if (!text) return
    onAddComment?.(text)
    setCommentText('')
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-2xl use-twemoji">
      <div className="mb-2 text-lg font-semibold">{title}</div>
      <p className="text-xl leading-relaxed text-gray-700 reading-prose">{content}</p>

      {/* Action bar */}
      <div className="pt-3 mt-4 border-t border-gray-200">
        <div className="flex items-center gap-4 text-gray-600">
          <button
            onClick={onToggleLike}
            className={`inline-flex items-center gap-2 text-sm font-medium hover:opacity-90 ${liked ? 'text-[#1877F2]' : ''}`}
          >
            <ThumbsUp size={18} className={liked ? 'fill-[#1877F2] text-[#1877F2]' : ''} />
            <span>Like</span>
            <span className="text-gray-400">{likeCount > 0 ? likeCount : ''}</span>
          </button>

          <div className="inline-flex items-center gap-2 text-sm">
            <MessageCircle size={18} />
            <span>Comment</span>
            <span className="text-gray-400">{comments.length > 0 ? comments.length : ''}</span>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="mt-3 space-y-3">
        <div className="flex items-center gap-2">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment() }}
            placeholder="Write a comment..."
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button onClick={handleAddComment} className="px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700">Post</button>
        </div>
        {comments.length > 0 && (
          <div className="space-y-2">
            {comments.map((c) => (
              <div key={c.id} className="flex items-start gap-2">
                <div className="bg-gray-200 rounded-full w-7 h-7" />
                <div className="px-3 py-2 text-sm text-gray-800 bg-gray-100 rounded-2xl reading-prose">{c.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Floating mascot overlay for dashboard
export function DashboardMascotOverlay({ position, isFloating, showMessage, currentMessage, handleMascotClick, mascotImage }) {
  // Draggable mascot logic
  const [dragging, setDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const mascotRef = React.useRef();

  // Accept setPosition from parent
  const { setPosition } = arguments[0];

  const handleDragStart = (e) => {
    setDragging(true);
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    setDragOffset({
      x: clientX - position.x,
      y: clientY - position.y
    });
  };
  const handleDragEnd = () => setDragging(false);
  const handleDrag = (e) => {
    if (!dragging) return;
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    const newX = clientX - dragOffset.x;
    const newY = clientY - dragOffset.y;
    // Clamp to window
    const clampedX = Math.max(0, Math.min(window.innerWidth - 100, newX));
    const clampedY = Math.max(0, Math.min(window.innerHeight - 100, newY));
    if (typeof position.x === 'number' && typeof position.y === 'number') {
      setPosition({ x: clampedX, y: clampedY });
    }
  };

  React.useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('touchmove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('touchmove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('touchmove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [dragging]);

  return (
    <motion.div
      ref={mascotRef}
      className="absolute z-[60] cursor-grab pointer-events-none"
      animate={{ x: position.x, y: position.y, rotate: isFloating ? [0, 2, -2, 0] : 0 }}
      transition={{ x: { type: 'spring', stiffness: 50, damping: 15, duration: 3 }, y: { type: 'spring', stiffness: 50, damping: 15, duration: 3 }, rotate: { duration: 4, ease: 'easeInOut', repeat: Infinity } }}
      style={{ width: 100, height: 100 }}
    >
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-300 to-pink-300 blur-xl opacity-30 pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="relative z-10 pointer-events-auto"
        animate={{ scale: showMessage ? [1, 1.15, 1.05] : [1, 1.05, 1], y: [0, -5, 0] }}
        transition={{ scale: { duration: 0.6, ease: 'easeInOut', repeat: showMessage ? 2 : Infinity }, y: { duration: 2.5, ease: 'easeInOut', repeat: Infinity } }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleMascotClick}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <img src={mascotImage} alt="MitraSetu Mascot" className="w-24 h-24 drop-shadow-2xl" draggable={false} />
        <motion.div className="absolute text-yellow-400 -top-2 -right-2" animate={{ scale: [0, 1, 0], rotate: [0, 180, 360] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}>✨</motion.div>
        <motion.div className="absolute text-pink-400 -bottom-1 -left-2" animate={{ scale: [0, 1, 0], rotate: [0, -180, -360] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>💫</motion.div>
      </motion.div>
      <AnimatePresence>
        {showMessage && currentMessage && (
          <motion.div initial={{ opacity: 0, scale: 0.5, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5, y: 20 }} className="absolute transform -translate-x-1/2 -top-20 left-1/2 min-w-64 max-w-80 pointer-events-auto">
            <div className="relative p-4 border-2 shadow-2xl bg-gradient-to-br from-white/95 to-purple-50/95 backdrop-blur-md border-purple-200/50 rounded-3xl">
              <div className="flex items-start gap-2">
                <span className="text-lg">{currentMessage.emoji}</span>
                <p className="text-sm leading-relaxed text-purple-800">{currentMessage.message}</p>
              </div>
              <div className="absolute bottom-0 transform -translate-x-1/2 translate-y-1/2 left-1/2">
                <div className="w-4 h-4 rotate-45 border-b-2 border-r-2 bg-gradient-to-br from-white/95 to-purple-50/95 border-purple-200/50" />
              </div>
              <motion.div className="absolute text-pink-400 -top-2 -right-2" animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>💖</motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function PostComposer({ onPost }) {
  const [text, setText] = React.useState('')
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-2xl">
      <div className="mb-2 font-semibold">Share a health tip</div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a short, helpful tip..."
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        rows={3}
      />
      <div className="mt-2 text-right">
        <button
          onClick={() => { if (text.trim()) { onPost?.(text.trim()); setText('') } }}
          className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Post Tip
        </button>
      </div>
    </div>
  )
}