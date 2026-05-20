import { useState } from 'react'
import AuthModal from '../auth/AuthModal.jsx'

const IconRotate = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
)

const IconZap = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const IconList = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)

const IconMenu = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

const features = [
  {
    icon: <IconRotate />,
    title: 'Fair Rotation',
    desc: 'Players with fewer rounds get priority every match — no manual tracking needed.',
    href: '#',
  },
  {
    icon: <IconZap />,
    title: 'Live Sync',
    desc: 'All devices update instantly via Firestore. Everyone sees the same court list in real time.',
    href: '#',
  },
  {
    icon: <IconList />,
    title: 'Quick Setup',
    desc: 'Paste your player list from Line or any chat and start a session in under a minute.',
    href: '#',
  },
]

export default function LandingPage() {
  const [modal, setModal] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      className="w-full min-h-screen overflow-auto text-white"
      style={{ backgroundColor: '#0f1923', fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#0f1923] font-bold text-lg"
            style={{ backgroundColor: '#34d399' }}
          >
            🏸
          </div>
          <span className="text-lg font-bold tracking-tight">Match Minton</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#group" className="lp-nav-link text-gray-300 hover:text-white transition">Group</a>
          <a href="#court" className="lp-nav-link text-gray-300 hover:text-white transition">Court</a>
          <button
            onClick={() => setModal('login')}
            className="lp-nav-link text-gray-300 hover:text-white transition"
          >
            Log in
          </button>
          <button
            onClick={() => setModal('signup')}
            className="px-5 py-2 rounded-full font-semibold transition text-[#0f1923]"
            style={{ backgroundColor: '#34d399' }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#6ee7b7'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = '#34d399'}
          >
            Sign up free
          </button>
        </div>

        <button
          className="md:hidden text-gray-300"
          onClick={() => setMenuOpen(v => !v)}
        >
          <IconMenu />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-4 space-y-2">
          <a
            href="#group"
            className="block py-2 px-4 rounded-lg text-gray-200"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            onClick={() => setMenuOpen(false)}
          >
            Group
          </a>
          <a
            href="#court"
            className="block py-2 px-4 rounded-lg text-gray-200"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            onClick={() => setMenuOpen(false)}
          >
            Court
          </a>
          <button
            onClick={() => { setModal('login'); setMenuOpen(false) }}
            className="block w-full py-2 px-4 rounded-lg text-left text-gray-200"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            Log in
          </button>
          <button
            onClick={() => { setModal('signup'); setMenuOpen(false) }}
            className="block w-full py-2 px-4 rounded-lg text-left text-gray-200"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            Sign up free
          </button>
        </div>
      )}

      {/* Hero */}
      <section className="relative px-6 md:px-12 pt-16 pb-24 flex flex-col lg:flex-row items-center gap-12 max-w-7xl mx-auto">
        <div className="flex-1 space-y-6">
          <p
            className="font-semibold text-sm uppercase tracking-widest lp-fade-up lp-fade-up-d1"
            style={{ color: '#34d399' }}
          >
            Badminton Session Manager
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight lp-fade-up lp-fade-up-d1">
            Run Your Session<br />
            <span style={{ color: '#34d399' }}>Effortlessly</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md lp-fade-up lp-fade-up-d2">
            Organise players into courts, rotate fairly, track rounds and costs — all from your phone, for free.
          </p>
          <div className="flex gap-4 lp-fade-up lp-fade-up-d3">
            <button
              onClick={() => setModal('signup')}
              className="px-7 py-3 font-bold rounded-full transition text-[#0f1923]"
              style={{ backgroundColor: '#34d399' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#6ee7b7'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#34d399'}
            >
              Get started free
            </button>
            <button
              onClick={() => setModal('login')}
              className="px-7 py-3 rounded-full text-gray-300 transition"
              style={{ border: '1px solid #4b5563' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#34d399'; e.currentTarget.style.color = '#34d399' }}
              onMouseOut={e => { e.currentTarget.style.borderColor = '#4b5563'; e.currentTarget.style.color = '#d1d5db' }}
            >
              Log in
            </button>
          </div>
        </div>

        {/* Shuttlecock illustration */}
        <div className="flex-1 flex justify-center lp-float">
          <svg width="260" height="260" viewBox="0 0 260 260" fill="none">
            <ellipse cx="130" cy="210" rx="50" ry="8" fill="rgba(52,211,153,0.15)" />
            <path
              d="M130 200 C130 200 100 140 100 100 C100 60 130 30 130 30 C130 30 160 60 160 100 C160 140 130 200 130 200Z"
              fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1"
            />
            <circle cx="130" cy="205" r="18" fill="#34d399" />
            <circle cx="130" cy="205" r="10" fill="#0f1923" />
            <path d="M115 130 Q130 110 145 130" stroke="#d1d5db" fill="none" strokeWidth="1" />
            <path d="M112 150 Q130 130 148 150" stroke="#d1d5db" fill="none" strokeWidth="1" />
            <path d="M110 170 Q130 150 150 170" stroke="#d1d5db" fill="none" strokeWidth="1" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 pb-24 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(f => (
            <div
              key={f.title}
              className="lp-card p-8 rounded-2xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ backgroundColor: 'rgba(52,211,153,0.2)' }}
              >
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 md:px-12 py-6 text-center text-sm"
        style={{ borderTop: '1px solid rgba(255,255,255,0.1)', color: '#6b7280' }}
      >
        © {new Date().getFullYear()} Match Minton. Rally together.
      </footer>

      {modal && <AuthModal mode={modal} onClose={() => setModal(null)} />}
    </div>
  )
}
