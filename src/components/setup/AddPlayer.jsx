import { useState } from 'react'
import { SKILLS, SKILL } from '../../models/index.js'
import { useLang } from '../../context/LangContext.jsx'

function parseBulkNames(text) {
  const processed = text.replace(/\s+(\d+\.(?!\d))/g, '\n$1')

  const rawNames = []
  for (const line of processed.split('\n')) {
    const match = line.trim().match(/^\d+\.\s*(.+)/)
    if (!match) continue
    const name = match[1].replace(/\s*\([^)]*\)/g, '').trim()
    if (!name || name.length < 2 || name.length > 25) continue
    rawNames.push(name)
  }

  const count = {}
  for (const name of rawNames) {
    const key = name.toLowerCase()
    count[key] = (count[key] || 0) + 1
  }

  const occurrence = {}
  return rawNames.map(name => {
    const key = name.toLowerCase()
    if (count[key] === 1) return name
    occurrence[key] = (occurrence[key] || 0) + 1
    return `${name} (${occurrence[key]})`
  })
}

function SkillPicker({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {SKILLS.map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-colors ${
            value === s ? 'bg-[#34d399] text-[#0f1923]' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  )
}

export default function AddPlayer({ onAdd, onAddBulk, maxPlayers = 36 }) {
  const { t } = useLang()
  const [mode, setMode] = useState('single')
  const [name, setName] = useState('')
  const [skill, setSkill] = useState(SKILL.B)
  const [bulkText, setBulkText] = useState('')
  const [bulkSkill, setBulkSkill] = useState(SKILL.B)
  const [editableNames, setEditableNames] = useState([])
  const [error, setError] = useState('')

  const handleBulkTextChange = (e) => {
    const text = e.target.value
    setBulkText(text)
    setEditableNames(parseBulkNames(text))
  }

  const handleNameChange = (i, value) => {
    setEditableNames(prev => prev.map((n, idx) => idx === i ? value : n))
  }

  const handleNameRemove = (i) => {
    setEditableNames(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleSingle = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    const result = await onAdd(trimmed, skill)
    if (result?.error === 'duplicate') setError(t.duplicateName)
    else if (result?.error === 'max') setError(t.maxReached(maxPlayers))
    else if (!result?.error) { setName(''); setError('') }
  }

  const handleBulk = async () => {
    const names = editableNames.map(n => n.trim()).filter(n => n.length >= 2)
    if (names.length === 0) return
    const result = await onAddBulk(names, bulkSkill)
    if (result?.error) return
    setBulkText('')
    setEditableNames([])
  }

  return (
    <div className="bg-stone-900 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-sm uppercase tracking-wide">{t.addPlayers}</h2>
        <div className="flex rounded-lg overflow-hidden border border-stone-700">
          <button
            onClick={() => setMode('single')}
            className={`px-3 py-1 text-xs font-medium transition-colors ${mode === 'single' ? 'bg-[#34d399] text-[#0f1923]' : 'text-stone-400 hover:text-white'}`}
          >
            {t.single}
          </button>
          <button
            onClick={() => setMode('bulk')}
            className={`px-3 py-1 text-xs font-medium transition-colors ${mode === 'bulk' ? 'bg-[#34d399] text-[#0f1923]' : 'text-stone-400 hover:text-white'}`}
          >
            {t.bulk}
          </button>
        </div>
      </div>

      {mode === 'single' ? (
        <form onSubmit={handleSingle} className="space-y-3">
          <input
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            placeholder={t.playerName}
            className="w-full bg-stone-800 rounded-lg px-3 py-2.5 text-white placeholder-stone-500 text-sm outline-none focus:ring-2 focus:ring-[#34d399]"
          />
          <SkillPicker value={skill} onChange={setSkill} />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            className="w-full bg-[#34d399] hover:bg-[#6ee7b7] text-[#0f1923] rounded-lg py-2.5 text-sm font-semibold transition-colors"
          >
            {t.addPlayer}
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          <textarea
            value={bulkText}
            onChange={handleBulkTextChange}
            placeholder={t.bulkPlaceholder}
            rows={7}
            className="w-full bg-stone-800 rounded-lg px-3 py-2.5 text-white placeholder-stone-500 text-sm outline-none focus:ring-2 focus:ring-[#34d399] resize-none"
          />

          {bulkText.length > 0 && editableNames.length === 0 && (
            <p className="text-yellow-500 text-xs">{t.bulkNoNames}</p>
          )}

          {editableNames.length > 0 && (
            <div className="bg-stone-800 rounded-lg px-3 py-2 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[#34d399] text-xs font-medium">
                  {t.bulkFound(editableNames.length)}
                </p>
                <button
                  type="button"
                  onClick={() => { setBulkText(''); setEditableNames([]) }}
                  className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
                >
                  {t.clearAll}
                </button>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {editableNames.map((n, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-stone-500 text-xs w-5 shrink-0 text-right">{i + 1}.</span>
                    <input
                      value={n}
                      onChange={e => handleNameChange(i, e.target.value)}
                      className="flex-1 bg-stone-700 rounded px-2 py-1 text-white text-xs outline-none focus:ring-1 focus:ring-[#34d399]"
                    />
                    <button
                      type="button"
                      onClick={() => handleNameRemove(i)}
                      className="text-stone-500 hover:text-red-400 text-xs px-1 shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <SkillPicker value={bulkSkill} onChange={setBulkSkill} />
          <button
            onClick={handleBulk}
            disabled={editableNames.length === 0}
            className="w-full bg-[#34d399] hover:bg-[#6ee7b7] disabled:bg-stone-800 disabled:text-stone-600 text-[#0f1923] rounded-lg py-2.5 text-sm font-semibold transition-colors"
          >
            {editableNames.length > 0 ? t.importCount(editableNames.length) : t.importBtn}
          </button>
        </div>
      )}
    </div>
  )
}
