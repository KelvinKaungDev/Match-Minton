import { useLang } from '../../context/LangContext.jsx'

export default function LangToggle({ inline = false }) {
  const { lang, toggle } = useLang()
  return (
    <button
      onClick={toggle}
      className={`bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold px-2.5 py-1 rounded-lg border border-stone-700 transition-colors ${
        inline ? '' : 'fixed top-3 right-4 z-50'
      }`}
    >
      {lang === 'th' ? 'EN' : 'TH'}
    </button>
  )
}
