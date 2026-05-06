import { STATUS } from '../../models/index.js'
import { useLang } from '../../context/LangContext.jsx'
import LangToggle from '../shared/LangToggle.jsx'

export default function SessionHeader({ session, players }) {
  const { t } = useLang()
  const counts = {
    playing: players.filter(p => p.status === STATUS.PLAYING).length,
    bench: players.filter(p => p.status === STATUS.BENCH).length,
    waiting: players.filter(p => p.status === STATUS.WAITING).length,
    done: players.filter(p => p.status === STATUS.DONE).length,
  }

  return (
    <div className="bg-stone-900 px-4 py-3 border-b border-stone-800 flex items-center justify-between">
      <div className="flex gap-4 text-xs">
        <span className="text-orange-400">{t.playing(counts.playing)}</span>
        <span className="text-sky-400">{t.benchCount(counts.bench)}</span>
        <span className="text-yellow-400">{t.waitingCount(counts.waiting)}</span>
        <span className="text-purple-400">{t.doneCount(counts.done)}</span>
      </div>
      <LangToggle inline />
    </div>
  )
}
