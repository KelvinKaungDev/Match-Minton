import { useState } from 'react'
import { SKILLS, SKILL } from '../../models/index.js'

function parseBulkNames(text) {
  // Insert newline before every "N." so single-line pastes become multi-line
  const processed = text.replace(/\s+(\d+\.(?!\d))/g, '\n$1')

  const seen = new Set()
  const names = []

  for (const line of processed.split('\n')) {
    // Only care about lines that start with a number+dot  e.g. "1." "38."
    const match = line.trim().match(/^\d+\.\s*(.+)/)
    if (!match) continue

    // Strip all (...) tags — (CF), (โจโจ้), (boy), (20.30), etc.
    const name = match[1].replace(/\s*\([^)]*\)/g, '').trim()
    if (!name || name.length < 2 || name.length > 25) continue

    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    names.push(name)
  }

  return names
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
            value === s ? 'bg-orange-600 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  )
}

export default function AddPlayer({ onAdd, onAddBulk, maxPlayers = 36 }) {
  const [mode, setMode] = useState('single')
  const [name, setName] = useState('')
  const [skill, setSkill] = useState(SKILL.B)
  const [bulkText, setBulkText] = useState('')
  const [bulkSkill, setBulkSkill] = useState(SKILL.B)
  const [error, setError] = useState('')

  const detectedNames = parseBulkNames(bulkText)

  const handleSingle = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    const result = await onAdd(trimmed, skill)
    if (result?.error === 'duplicate') setError('Name already exists')
    else if (result?.error === 'max') setError(`Maximum ${maxPlayers} players reached`)
    else { setName(''); setError('') }
  }

  const handleBulk = async () => {
    if (detectedNames.length === 0) return
    await onAddBulk(detectedNames, bulkSkill)
    setBulkText('')
  }

  return (
    <div className="bg-stone-900 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-sm uppercase tracking-wide">Add Players</h2>
        <div className="flex rounded-lg overflow-hidden border border-stone-700">
          <button
            onClick={() => setMode('single')}
            className={`px-3 py-1 text-xs font-medium transition-colors ${mode === 'single' ? 'bg-orange-600 text-white' : 'text-stone-400 hover:text-white'}`}
          >
            Single
          </button>
          <button
            onClick={() => setMode('bulk')}
            className={`px-3 py-1 text-xs font-medium transition-colors ${mode === 'bulk' ? 'bg-orange-600 text-white' : 'text-stone-400 hover:text-white'}`}
          >
            Bulk
          </button>
        </div>
      </div>

      {mode === 'single' ? (
        <form onSubmit={handleSingle} className="space-y-3">
          <input
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            placeholder="Player name"
            className="w-full bg-stone-800 rounded-lg px-3 py-2.5 text-white placeholder-stone-500 text-sm outline-none focus:ring-2 focus:ring-orange-500"
          />
          <SkillPicker value={skill} onChange={setSkill} />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-500 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors"
          >
            Add Player
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          <textarea
            value={bulkText}
            onChange={e => setBulkText(e.target.value)}
            placeholder={'วางรายชื่อจาก Line/Chat ได้เลย เช่น:\n1. ชิ (CF)\n2. พี่ยู (CF)\n3. Hong (เพื่อนแทน) (CF)\n...\nระบบจะดึงชื่อให้อัตโนมัติ'}
            rows={7}
            className="w-full bg-stone-800 rounded-lg px-3 py-2.5 text-white placeholder-stone-500 text-sm outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          />

          {bulkText.length > 0 && detectedNames.length === 0 && (
            <p className="text-yellow-500 text-xs">
              ไม่พบรายชื่อ — ลองวางข้อความที่มีเลข เช่น "1. ชื่อ"
            </p>
          )}

          {detectedNames.length > 0 && (
            <div className="bg-stone-800 rounded-lg px-3 py-2 space-y-1">
              <p className="text-orange-400 text-xs font-medium">
                พบ {detectedNames.length} คน
              </p>
              <p className="text-stone-400 text-xs leading-relaxed">
                {detectedNames.join(', ')}
              </p>
            </div>
          )}

          <SkillPicker value={bulkSkill} onChange={setBulkSkill} />
          <button
            onClick={handleBulk}
            disabled={detectedNames.length === 0}
            className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-stone-800 disabled:text-stone-600 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors"
          >
            {detectedNames.length > 0 ? `Import ${detectedNames.length} คน` : 'Import'}
          </button>
        </div>
      )}
    </div>
  )
}
