import { useState } from 'react'
import { useSubscription } from '../../hooks/useSubscription.js'

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3A5.25 5.25 0 0 0 12 1.5Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
    </svg>
  )
}

export default function ProGate({ children }) {
  const { isPro, upgradeToProFree } = useSubscription()
  const [upgrading, setUpgrading] = useState(false)
  const [showToast, setShowToast] = useState(false)

  if (isPro) return children

  const handleUpgrade = async () => {
    setUpgrading(true)
    const result = await upgradeToProFree()
    setUpgrading(false)
    if (result.success) {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  return (
    <>
      <div className="relative rounded-xl overflow-hidden">
        <div className="pointer-events-none select-none blur-sm opacity-30">
          {children}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-stone-950/70 rounded-xl z-10">
          <div className="text-stone-400">
            <LockIcon />
          </div>
          <span className="text-white text-sm font-semibold tracking-wide">Pro Feature</span>
          <button
            onClick={handleUpgrade}
            disabled={upgrading}
            className="bg-[#34d399] hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-stone-950 text-sm font-bold px-5 py-2 rounded-lg transition-colors"
          >
            {upgrading ? 'Upgrading…' : 'Upgrade to Pro'}
          </button>
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg animate-fade-in">
          You are now Pro! 🎉
        </div>
      )}
    </>
  )
}
