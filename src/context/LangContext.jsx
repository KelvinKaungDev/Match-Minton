import { createContext, useContext, useState } from 'react'
import { strings } from '../i18n.js'

const LangContext = createContext()

export function LangProvider({ children }) {
  const [lang, setLang] = useState('th')
  const t = strings[lang]
  const toggle = () => setLang(l => l === 'th' ? 'en' : 'th')
  return (
    <LangContext.Provider value={{ t, lang, toggle }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
