import { useState, useMemo } from 'react'
import { courts, DISTRICTS } from '../../data/bangkokCourts.js'

const IconMapPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const IconPhone = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.62 4.35 2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const IconExternalLink = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

function CourtCard({ court }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(court.mapsQuery)}`

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 transition-transform hover:-translate-y-0.5"
      style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-white text-base leading-tight">{court.name}</h3>
          <span
            className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(52,211,153,0.15)', color: '#34d399' }}
          >
            {court.district}
          </span>
        </div>
        <div
          className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg"
          style={{ backgroundColor: 'rgba(52,211,153,0.1)' }}
        >
          🏸
        </div>
      </div>

      {/* Address */}
      <div className="flex items-start gap-1.5 text-gray-400 text-sm">
        <span className="mt-0.5 shrink-0" style={{ color: '#34d399' }}><IconMapPin /></span>
        <span className="leading-snug">{court.address}</span>
      </div>

      {/* Phone */}
      <div className="flex items-center gap-1.5 text-gray-400 text-sm">
        <span style={{ color: '#34d399' }}><IconPhone /></span>
        <a
          href={`tel:${court.phone}`}
          className="hover:text-white transition-colors"
        >
          {court.phone}
        </a>
      </div>

      {/* Courts count + map button */}
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-500">
          {court.courts} courts available
        </span>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          style={{ backgroundColor: 'rgba(52,211,153,0.15)', color: '#34d399' }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(52,211,153,0.25)'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(52,211,153,0.15)'}
        >
          <IconExternalLink />
          View on Map
        </a>
      </div>
    </div>
  )
}

export default function CourtsSection() {
  const [activeDistrict, setActiveDistrict] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return courts.filter(c => {
      const matchDistrict = activeDistrict === 'All' || c.district === activeDistrict
      const q = search.trim().toLowerCase()
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.district.toLowerCase().includes(q) || c.address.toLowerCase().includes(q)
      return matchDistrict && matchSearch
    })
  }, [activeDistrict, search])

  return (
    <section
      id="court"
      className="px-6 md:px-12 py-20 max-w-7xl mx-auto"
    >
      {/* Heading */}
      <div className="mb-10 space-y-2">
        <p className="font-semibold text-sm uppercase tracking-widest" style={{ color: '#34d399' }}>
          Find a Court
        </p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">
          Badminton Courts in Bangkok
        </h2>
        <p className="text-gray-400 text-base max-w-xl">
          Browse venues across Bangkok. Filter by district to find a court near you.
        </p>
      </div>

      {/* Search bar */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-6 max-w-md"
        style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <span className="text-gray-500"><IconSearch /></span>
        <input
          type="text"
          placeholder="Search by name or area..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full"
        />
      </div>

      {/* District chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {DISTRICTS.map(d => (
          <button
            key={d}
            onClick={() => setActiveDistrict(d)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={
              activeDistrict === d
                ? { backgroundColor: '#34d399', color: '#0f1923' }
                : { backgroundColor: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }
            }
          >
            {d}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-gray-500 text-sm mb-5">
        {filtered.length} {filtered.length === 1 ? 'court' : 'courts'} found
        {activeDistrict !== 'All' ? ` in ${activeDistrict}` : ''}
      </p>

      {/* Court grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(c => <CourtCard key={c.id} court={c} />)}
        </div>
      ) : (
        <div className="py-16 text-center text-gray-500">
          No courts found. Try a different district or search term.
        </div>
      )}
    </section>
  )
}
