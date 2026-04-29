const colors = {
  S: 'bg-amber-500/20 text-amber-400',
  A: 'bg-sky-500/20 text-sky-400',
  B: 'bg-teal-500/20 text-teal-400',
  C: 'bg-stone-500/20 text-stone-400',
}

export default function SkillBadge({ skill }) {
  return (
    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${colors[skill] ?? colors.C}`}>
      {skill}
    </span>
  )
}
