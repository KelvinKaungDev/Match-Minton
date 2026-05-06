import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AuthModal({ mode = 'login', onClose }) {
  const { login, signup } = useAuth()
  const [isLogin, setIsLogin] = useState(mode === 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!isLogin && password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await signup(email, password)
      }
      onClose()
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsLogin(v => !v)
    setError('')
    setPassword('')
    setConfirm('')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg">
            {isLogin ? 'Log in' : 'Create account'}
          </h2>
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-300 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-stone-400 text-xs mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full bg-stone-800 border border-stone-700 text-white rounded-lg px-3 py-2.5 text-sm placeholder-stone-600 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-stone-400 text-xs mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-stone-800 border border-stone-700 text-white rounded-lg px-3 py-2.5 text-sm placeholder-stone-600 focus:outline-none focus:border-orange-500"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="text-stone-400 text-xs mb-1 block">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-stone-800 border border-stone-700 text-white rounded-lg px-3 py-2.5 text-sm placeholder-stone-600 focus:outline-none focus:border-orange-500"
              />
            </div>
          )}

          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-stone-700 disabled:text-stone-500 text-white font-semibold rounded-xl py-3 text-sm transition-colors mt-1"
          >
            {loading ? '...' : isLogin ? 'Log in' : 'Create account'}
          </button>
        </form>

        <p className="text-stone-500 text-xs text-center mt-4">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={switchMode}
            className="text-orange-400 hover:text-orange-300 font-medium"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  )
}

function friendlyError(code) {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists'
    case 'auth/invalid-email':
      return 'Invalid email address'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later'
    default:
      return 'Something went wrong. Please try again'
  }
}
