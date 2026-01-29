// import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'
import { lazy, Suspense } from 'react'
const Auth = lazy(() => import('./pages/Auth'))
import Profile from './pages/Profile';
import LandingPage from './pages/LandingPage'
import Home from './pages/Home'
import ChatPage from './pages/ChatPage'
import PeerChat from './pages/PeerChat';
import Landing from './pages/Landing';
import LivePage from './pages/LivePage';
import Onboarding from './pages/onboarding';


function App() {
  return (
    <Router>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-purple-600">Loading…</div>}>
      <Routes>
  {/* <Route path="/" element={<Auth />} /> */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/auth" element={<Auth />} />
      <Route path="/home" element={<Home />} />
      <Route path="/journey" element={<ChatPage />} />
      <Route path="/live" element={<LivePage />} />
      <Route path="/resources" element={<PeerChat />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/onboarding" element={<Onboarding />} />
  </Routes>
      </Suspense>
    </Router>
  );
}

export default App;