import { QRCode } from 'react-qr-code'

function SkillDot({ skill }) {
  const colors = {
    S: 'bg-amber-400',
    A: 'bg-sky-400',
    B: 'bg-teal-400',
    C: 'bg-stone-400',
  }
  return (
    <span
      title={skill}
      className={`inline-block w-2 h-2 rounded-full ${colors[skill] ?? colors.C}`}
    />
  )
}

function TeamList({ label, players }) {
  return (
    <div className="flex-1 min-w-0">
      <p className="text-stone-500 text-xs font-semibold uppercase tracking-wide mb-1">{label}</p>
      <div className="space-y-0.5">
        {players.map(p => (
          <div key={p.id} className="flex items-center gap-1.5">
            <SkillDot skill={p.skill} />
            <span className="text-white text-sm truncate">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CourtCodeCard({ court }) {
  const { code, courtName, courtNumber, teamA = [], teamB = [], scoreConfig = {} } = court

  return (
    <div className="bg-stone-900 rounded-2xl p-5 flex flex-col gap-4 border border-stone-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-stone-400 text-xs font-semibold uppercase tracking-wide">
          Court {courtName ?? courtNumber}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-stone-500">
          <span>{scoreConfig.numberOfGames} games</span>
          <span>·</span>
          <span>to {scoreConfig.pointsToWin}</span>
          {scoreConfig.deuceRule && <span>· deuce {scoreConfig.maxPoints}</span>}
        </div>
      </div>

      {/* Code + QR side by side */}
      <div className="flex items-center gap-4">
        {/* Large code */}
        <div className="flex-1">
          <p className="text-stone-500 text-xs mb-1">Judge Code</p>
          <p
            className="text-5xl font-black tracking-widest text-[#34d399] leading-none"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {code}
          </p>
        </div>

        {/* QR */}
        <div className="bg-white p-2 rounded-xl shrink-0">
          <QRCode value={code} size={80} level="M" />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-stone-800" />

      {/* Teams */}
      <div className="flex gap-4">
        <TeamList label="Team A" players={teamA} />
        <div className="w-px bg-stone-800 shrink-0" />
        <TeamList label="Team B" players={teamB} />
      </div>
    </div>
  )
}
