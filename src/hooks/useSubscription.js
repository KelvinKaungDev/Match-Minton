import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/apiClient.js'
import { useAuth } from '../context/AuthContext.jsx'

export function useSubscription() {
  const { user } = useAuth()
  const [tier, setTier] = useState('free')

  const refresh = useCallback(async () => {
    if (!user) return
    try {
      const current = await api.get(`/api/users/${user.uid}`)
      setTier(current.tier ?? 'free')
    } catch {
      setTier('free')
    }
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const upgradeToProFree = async () => {
    if (!user) return { success: false }
    const current = await api.get(`/api/users/${user.uid}`)
    await api.put(`/api/users/${user.uid}`, {
      name: current.name,
      email: current.email,
      avatar: current.avatar,
      provider: current.provider,
      tier: 'pro',
    })
    setTier('pro')
    return { success: true }
  }

  return { tier, isPro: tier === 'pro', upgradeToProFree }
}
