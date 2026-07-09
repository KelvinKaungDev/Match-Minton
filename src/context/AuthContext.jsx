import { createContext, useContext, useState, useEffect } from 'react'
import { api, getToken, setToken } from '../services/apiClient.js'

const AuthContext = createContext()
const USER_KEY = 'mm_user'

function readStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function storeSession(authResponse) {
  setToken(authResponse.token)
  const user = { uid: authResponse.id, id: authResponse.id, name: authResponse.name, email: authResponse.email }
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  return user
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = still loading

  useEffect(() => {
    setUser(getToken() ? readStoredUser() : null)
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password })
    setUser(storeSession(res))
  }

  const signup = async (name, email, password) => {
    const res = await api.post('/api/auth/register', { name, email, password })
    setUser(storeSession(res))
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
