import { useState, useEffect } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../services/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'

export function useSubscription() {
  const { user } = useAuth()
  const [tier, setTier] = useState('free')

  useEffect(() => {
    if (!user) return
    return onSnapshot(doc(db, 'users', user.uid), (snap) => {
      setTier(snap.exists() ? (snap.data().tier ?? 'free') : 'free')
    })
  }, [user])

  const upgradeToProFree = async () => {
    if (!user) return { success: false }
    await setDoc(doc(db, 'users', user.uid), { tier: 'pro' }, { merge: true })
    return { success: true }
  }

  return { tier, isPro: tier === 'pro', upgradeToProFree }
}
