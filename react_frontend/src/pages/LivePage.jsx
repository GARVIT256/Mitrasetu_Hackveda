import React from 'react'
import { Nav } from '../components/nav'
import { GeminiLiveControls } from '../components/GeminiLiveControls'

export default function LivePage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <main className="max-w-6xl mx-auto px-4 pt-6 md:pt-28 pb-8">
        <GeminiLiveControls />
      </main>
    </div>
  )
}


