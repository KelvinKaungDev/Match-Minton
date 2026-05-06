import { useState } from 'react'
import AuthModal from '../auth/AuthModal.jsx'

export default function LandingPage() {
  const [modal, setModal] = useState(null) // 'login' | 'signup' | null

  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-stone-800 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏸</span>
            <span className="text-orange-400 font-bold text-lg tracking-tight">Match Minton</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModal('login')}
              className="text-stone-300 hover:text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => setModal('signup')}
              className="bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
            >
              Sign up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="text-5xl mb-6">🏸</div>
        <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
          Smart Badminton<br />Session Manager
        </h1>
        <p className="text-stone-400 text-base max-w-xs mb-8">
          Organise players into courts, rotate fairly, and keep everyone in sync — all from your phone.
        </p>
        <button
          onClick={() => setModal('signup')}
          className="bg-orange-600 hover:bg-orange-500 text-white font-semibold px-8 py-3 rounded-xl text-base transition-colors"
        >
          Get started free
        </button>
        <button
          onClick={() => setModal('login')}
          className="text-stone-500 hover:text-stone-300 text-sm mt-3 transition-colors"
        >
          Already have an account? Log in
        </button>
      </div>

      {/* Features */}
      <div className="px-4 pb-16">
        <div className="max-w-lg mx-auto grid grid-cols-3 gap-3">
          {[
            { icon: '⚖️', title: 'Fair Rotation', desc: 'Players with fewer rounds get priority every match' },
            { icon: '🔄', title: 'Live Sync', desc: 'All devices update instantly via Firestore' },
            { icon: '⚡', title: 'Quick Setup', desc: 'Paste a player list and start in under a minute' },
          ].map(f => (
            <div key={f.title} className="bg-stone-900 border border-stone-800 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1.5">{f.icon}</div>
              <div className="text-white text-xs font-semibold mb-1">{f.title}</div>
              <div className="text-stone-500 text-xs leading-snug">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <AuthModal mode={modal} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
