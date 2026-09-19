import { useState, useEffect } from 'react'
import {
  MagnifyingGlass, Microphone, MapPin, CalendarBlank, Users,
  AirplaneTakeoff, Buildings, Car,
  Star, ArrowRight, Check, ArrowLeft,
  X, DotsSixVertical, Funnel, SortAscending,
  PaperPlaneTilt, Shield,
  Lightning, Sparkle, ListBullets, Basket
} from '@phosphor-icons/react'

type Screen = 'search' | 'loading' | 'results' | 'packages' | 'builder'

// ─── ixTour Logo — original mark paths from brand SVG ────────────────────────

function IxMark({ height = 32 }: { height?: number }) {
  const w = Math.round(height * (88 / 64))
  return (
    <svg width={w} height={height} viewBox="0 0 88 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M33.7383 28.8926H17.4285L13.1682 12.1003H29.4779L33.7383 28.8926Z" fill="#085EAC"/>
      <path d="M29.263 12.1005L19.3652 51.1101L16.3098 63.2521H0L3.0554 51.1101L12.9532 12.1005H29.263Z" fill="#085EAC"/>
      <path d="M60.1611 0H43.8513L27.8428 63.2507H44.1095L60.1611 0Z" fill="#00A76E"/>
      <path d="M54.2224 34.316H70.5322L74.7925 51.1082H58.4828L54.2224 34.316Z" fill="#085EAC"/>
      <path d="M87.7449 0L84.6896 12.099L74.7918 51.1086H58.482L68.3798 12.099L71.4352 0H87.7449Z" fill="#085EAC"/>
    </svg>
  )
}

function IxTravelLogo({ light = false, size = 'md' }: { light?: boolean; size?: 'sm' | 'md' }) {
  const markH = size === 'sm' ? 24 : 30
  const wordColor = light ? '#F7F6F2' : '#212121'
  const subColor  = light ? 'rgba(247,246,242,0.50)' : '#6B7A8D'
  const wSize     = size === 'sm' ? 16 : 20
  const sSize     = size === 'sm' ?  7 :  8

  return (
    <div className="flex items-center gap-2.5">
      <IxMark height={markH} />
      <div className="flex flex-col leading-none" style={{ gap: 3 }}>
        <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: wSize, color: wordColor, letterSpacing: '-0.01em', lineHeight: 1 }}>
          ixtour
        </span>
        <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: sSize, color: subColor, letterSpacing: '0.15em', textTransform: 'uppercase', lineHeight: 1 }}>
          travel platform
        </span>
      </div>
    </div>
  )
}

interface FlightCard { id: string; from: string; to: string; airline: string; departure: string; arrival: string; duration: string; price: number; source: string }
interface HotelCard { id: string; name: string; location: string; stars: number; nights: number; price: number; source: string; image: string }
interface TransferCard { id: string; type: string; from: string; to: string; price: number; source: string }

const FLIGHTS: FlightCard[] = [
  { id: 'f1', from: 'BAK', to: 'CDG', airline: 'AZAL', departure: '06:40', arrival: '09:55', duration: '5s 15d', price: 420, source: 'Booking.com' },
  { id: 'f2', from: 'BAK', to: 'CDG', airline: 'Turkish Airlines', departure: '13:20', arrival: '17:05', duration: '5s 45d', price: 385, source: 'Skyscanner' },
  { id: 'f3', from: 'BAK', to: 'CDG', airline: 'Lufthansa', departure: '08:15', arrival: '13:40', duration: '6s 25d', price: 510, source: 'Booking.com' },
]

const HOTELS: HotelCard[] = [
  { id: 'h1', name: 'Hôtel Lutetia', location: 'Saint-Germain', stars: 5, nights: 5, price: 890, source: 'Booking.com', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=260&fit=crop&auto=format' },
  { id: 'h2', name: 'Le Marais Loft', location: 'Le Marais, Paris', stars: 4, nights: 5, price: 620, source: 'Airbnb', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=260&fit=crop&auto=format' },
  { id: 'h3', name: 'Montmartre Studio', location: 'Montmartre', stars: 4, nights: 5, price: 445, source: 'Airbnb', image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=260&fit=crop&auto=format' },
  { id: 'h4', name: 'Plaza Athénée', location: 'Champs-Élysées', stars: 5, nights: 5, price: 1850, source: 'Booking.com', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=260&fit=crop&auto=format' },
]

const TRANSFERS: TransferCard[] = [
  { id: 't1', type: 'Şəxsi avtomobil', from: 'CDG Hava limanı', to: 'Otel', price: 65, source: 'Booking.com' },
  { id: 't2', type: 'Business sedan', from: 'CDG Hava limanı', to: 'Otel', price: 95, source: 'Airbnb' },
  { id: 't3', type: 'Premium SUV', from: 'CDG Hava limanı', to: 'Otel', price: 145, source: 'Booking.com' },
]

const SOURCE_COLORS: Record<string, string> = {
  'Booking.com': 'bg-[#003580] text-white',
  'Airbnb': 'bg-[#FF5A5F] text-white',
  'Skyscanner': 'bg-[#0770E3] text-white',
}

function SourceBadge({ source }: { source: string }) {
  return (
    <span className={`text-[10px] font-600 px-2 py-0.5 rounded-full ${SOURCE_COLORS[source] || 'bg-gray-200 text-gray-700'}`}>
      {source}
    </span>
  )
}

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={11} weight={i < count ? 'fill' : 'regular'} className={i < count ? 'text-gold' : 'text-border'} />
      ))}
    </div>
  )
}

// ─── Screen 1: Search ────────────────────────────────────────────────────────

function SearchScreen({ onSearch }: { onSearch: () => void }) {
  const [query, setQuery] = useState('')
  const [listening, setListening] = useState(false)
  const [destination, setDestination] = useState('Paris, Fransa')
  const [dates, setDates] = useState('12–17 Oktyabr 2026')
  const [passengers, setPassengers] = useState('2 sərnişin')

  const toggleListen = () => {
    setListening(v => !v)
    if (!listening) {
      setTimeout(() => {
        setListening(false)
        setQuery('Paris\'ə 5 gecəlik uçuş və otel, 2 nəfər')
      }, 2800)
    }
  }

  return (
    <div className="min-h-screen bg-deep-navy flex flex-col relative overflow-hidden">
      {/* bg image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1400&h=900&fit=crop&auto=format"
          alt="Paris"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep-navy/70 via-deep-navy/50 to-deep-navy" />
      </div>

      {/* Floating ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="anim-orb absolute w-72 h-72 rounded-full bg-gold/10 blur-3xl -top-20 -right-20" style={{ animationDelay: '0s' }} />
        <div className="anim-orb absolute w-56 h-56 rounded-full bg-[#085EAC]/15 blur-3xl bottom-20 -left-20" style={{ animationDelay: '-4s' }} />
        <div className="anim-orb absolute w-40 h-40 rounded-full bg-gold/8 blur-2xl bottom-1/3 right-1/4" style={{ animationDelay: '-8s' }} />
      </div>

      {/* Nav */}
      <nav className="anim-slide-down relative z-10 flex items-center justify-between px-5 py-4" style={{ animationDelay: '0s' }}>
        <div className="flex items-center gap-2">
          <IxTravelLogo light size="md" />
        </div>
        <button className="text-xs text-ivory border border-ivory/20 px-3 py-1.5 rounded-lg font-500 hover:bg-ivory/10 transition-colors">
          Daxil ol
        </button>
      </nav>

      {/* ── DESKTOP: two-column hero ── */}
      <div className="relative z-10 flex-1 hidden md:flex items-center gap-12 lg:gap-20 max-w-6xl mx-auto w-full px-10 py-12">

        {/* Left: brand + headline */}
        <div className="flex-1 min-w-0">
          <p className="anim-fade-up text-gold text-[10px] font-600 tracking-[0.22em] uppercase mb-5" style={{ animationDelay: '0.1s' }}>
            AI Səyahət Axtarışı
          </p>
          <h1 className="anim-fade-up text-ivory font-800 leading-[1.08] mb-5" style={{ fontSize: 'clamp(2.6rem, 4vw, 3.8rem)', animationDelay: '0.2s' }}>
            Ən yaxşı<br />
            <span className="text-gold">səyahəti</span><br />
            tapın
          </h1>
          <p className="anim-fade-up text-ivory/50 text-sm leading-relaxed mb-10 max-w-xs" style={{ animationDelay: '0.32s' }}>
            Booking.com, Airbnb, Skyscanner — yüzlərlə mənbə eyni anda axtarılır.
          </p>

          {/* Trust stats */}
          <div className="anim-fade-up flex items-center gap-8" style={{ animationDelay: '0.42s' }}>
            {[['90+', 'nəticə'], ['3', 'mənbə'], ['< 5s', 'axtarış']].map(([val, label]) => (
              <div key={label}>
                <p className="text-ivory text-xl font-800 leading-none">{val}</p>
                <p className="text-ivory/40 text-[10px] font-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: search card */}
        <div className="anim-scale-in w-[460px] lg:w-[500px] shrink-0" style={{ animationDelay: '0.28s' }}>
          <div className="bg-ivory/[0.07] backdrop-blur-xl border border-ivory/10 rounded-2xl p-3 shadow-2xl">
            {/* AI input */}
            <div className="relative flex items-center gap-2.5 bg-ivory/[0.09] rounded-xl px-4 py-3.5 mb-3 border border-ivory/10">
              <MagnifyingGlass size={17} className="text-muted shrink-0" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="AI ilə axtarın..."
                className="flex-1 bg-transparent text-ivory placeholder-ivory/30 text-sm font-400 outline-none min-w-0"
              />
              <button
                onClick={toggleListen}
                className={`relative shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${listening ? 'bg-error/20' : 'bg-ivory/10'}`}
              >
                {listening && <span className="absolute inset-0 rounded-xl border-2 border-error animate-ping opacity-40" />}
                {listening ? (
                  <div className="flex items-end gap-0.5 h-4">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="listening-bar w-0.5 bg-error rounded-full" style={{ animationDelay: `${(i-1)*0.1}s` }} />
                    ))}
                  </div>
                ) : (
                  <Microphone size={15} className="text-ivory/60" />
                )}
              </button>
            </div>

            {/* Structured fields */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { icon: <MapPin size={13} className="text-gold" />, label: 'Təyinat', value: destination, setValue: setDestination },
                { icon: <CalendarBlank size={13} className="text-gold" />, label: 'Tarixlər', value: dates, setValue: setDates },
                { icon: <Users size={13} className="text-gold" />, label: 'Sərnişinlər', value: passengers, setValue: setPassengers },
              ].map(({ icon, label, value, setValue }) => (
                <div key={label} className="bg-ivory/[0.05] border border-ivory/10 rounded-xl px-3 py-2.5 flex items-center gap-2">
                  {icon}
                  <div className="flex-1 min-w-0">
                    <p className="text-ivory/40 text-[9px] font-600 uppercase tracking-wider">{label}</p>
                    <input
                      type="text"
                      value={value}
                      onChange={e => setValue(e.target.value)}
                      className="bg-transparent text-ivory/90 text-xs font-500 w-full outline-none truncate"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onSearch}
              className="w-full bg-gold hover:bg-gold/90 text-deep-navy font-700 text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Lightning size={15} weight="fill" />
              Bütün Mənbələrdə Axtar
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="anim-fade-in mt-4 flex items-center justify-center gap-2" style={{ animationDelay: '0.7s' }}>
            <span className="text-ivory/25 text-[10px] font-500">Mənbələr:</span>
            {['Booking.com', 'Airbnb', 'Skyscanner'].map((s, i) => (
              <span key={s} className="text-ivory/35 text-[10px] border border-ivory/10 px-2 py-0.5 rounded-md font-500" style={{ animationDelay: `${0.75 + i * 0.1}s` }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── MOBILE: stacked hero ── */}
      <div className="relative z-10 flex-1 md:hidden flex flex-col justify-center px-5 pt-2 pb-6">
        <div className="text-center mb-7">
          <p className="anim-fade-up text-gold text-[10px] font-600 tracking-[0.2em] uppercase mb-3" style={{ animationDelay: '0.1s' }}>AI Səyahət Axtarışı</p>
          <h1 className="anim-fade-up text-ivory text-3xl font-800 leading-tight mb-2" style={{ animationDelay: '0.2s' }}>
            Ən yaxşı<br />
            <span className="text-gold">səyahəti</span> tap
          </h1>
          <p className="anim-fade-up text-ivory/50 text-xs font-400 leading-relaxed max-w-xs mx-auto" style={{ animationDelay: '0.32s' }}>
            Yüzlərlə mənbəni eyni anda axtarır
          </p>
        </div>

        {/* Search card */}
        <div className="anim-scale-in bg-ivory/[0.07] backdrop-blur-xl border border-ivory/10 rounded-2xl p-2.5 shadow-2xl" style={{ animationDelay: '0.44s' }}>
          <div className="relative flex items-center gap-2.5 bg-ivory/[0.09] rounded-xl px-3.5 py-3 mb-2.5 border border-ivory/10">
            <MagnifyingGlass size={17} className="text-muted shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="AI ilə axtarın..."
              className="flex-1 bg-transparent text-ivory placeholder-ivory/30 text-sm font-400 outline-none min-w-0"
            />
            <button
              onClick={toggleListen}
              className={`relative shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${listening ? 'bg-error/20' : 'bg-ivory/10'}`}
            >
              {listening && <span className="absolute inset-0 rounded-xl border-2 border-error animate-ping opacity-40" />}
              {listening ? (
                <div className="flex items-end gap-0.5 h-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="listening-bar w-0.5 bg-error rounded-full" style={{ animationDelay: `${(i-1)*0.1}s` }} />
                  ))}
                </div>
              ) : (
                <Microphone size={15} className="text-ivory/60" />
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 mb-2.5">
            {[
              { icon: <MapPin size={13} className="text-gold" />, label: 'Təyinat', value: destination, setValue: setDestination },
              { icon: <CalendarBlank size={13} className="text-gold" />, label: 'Tarixlər', value: dates, setValue: setDates },
              { icon: <Users size={13} className="text-gold" />, label: 'Sərnişinlər', value: passengers, setValue: setPassengers },
            ].map(({ icon, label, value, setValue }) => (
              <div key={label} className="bg-ivory/[0.05] border border-ivory/10 rounded-xl px-3 py-2.5 flex items-center gap-2">
                {icon}
                <div className="flex-1 min-w-0">
                  <p className="text-ivory/40 text-[9px] font-600 uppercase tracking-wider">{label}</p>
                  <input
                    type="text"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    className="bg-transparent text-ivory/90 text-xs font-500 w-full outline-none truncate"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onSearch}
            className="w-full bg-gold hover:bg-gold/90 text-deep-navy font-700 text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Lightning size={15} weight="fill" />
            Bütün Mənbələrdə Axtar
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="anim-fade-in mt-5 flex items-center justify-center gap-2 flex-wrap" style={{ animationDelay: '0.7s' }}>
          <span className="text-ivory/30 text-[10px] font-500">Mənbələr:</span>
          {['Booking.com', 'Airbnb', 'Skyscanner'].map((s, i) => (
            <span key={s} className="text-ivory/40 text-[10px] border border-ivory/10 px-2 py-0.5 rounded-md font-500" style={{ animationDelay: `${0.75 + i * 0.1}s` }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Screen 2a: Loading ───────────────────────────────────────────────────────

function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState({ booking: 0, airbnb: 0, flights: 0 })
  const [done, setDone] = useState({ booking: false, airbnb: false, flights: false })

  useEffect(() => {
    const speed = { booking: 1.8, airbnb: 2.2, flights: 1.4 }
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = {
          booking: Math.min(100, prev.booking + speed.booking),
          airbnb: Math.min(100, prev.airbnb + speed.airbnb),
          flights: Math.min(100, prev.flights + speed.flights),
        }
        setDone({ booking: next.booking >= 100, airbnb: next.airbnb >= 100, flights: next.flights >= 100 })
        if (next.booking >= 100 && next.airbnb >= 100 && next.flights >= 100) {
          clearInterval(interval)
          setTimeout(onDone, 500)
        }
        return next
      })
    }, 50)
    return () => clearInterval(interval)
  }, [onDone])

  const sources = [
    { key: 'booking' as const, name: 'Booking.com', icon: <Buildings size={18} />, found: '47 otel tapıldı', color: '#003580' },
    { key: 'airbnb' as const, name: 'Airbnb', icon: <Buildings size={18} />, found: '31 ev tapıldı', color: '#FF5A5F' },
    { key: 'flights' as const, name: 'Uçuş mənbələri', icon: <AirplaneTakeoff size={18} />, found: '12 uçuş tapıldı', color: '#B5673D' },
  ]

  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="relative inline-flex items-center justify-center mb-5">
            {/* Orbit ring */}
            <div className="absolute w-16 h-16 rounded-full border-2 border-dashed border-gold/25 anim-orbit" />
            {/* Counter dot */}
            <div className="absolute w-16 h-16 flex items-center justify-start anim-orbit" style={{ animationDuration: '1.6s' }}>
              <div className="w-2.5 h-2.5 rounded-full bg-gold -ml-1.5" />
            </div>
            <IxTravelLogo light={false} size="md" />
          </div>
          <h2 className="anim-fade-up text-xl font-700 text-text mb-1">Axtarılır...</h2>
          <p className="anim-fade-up text-muted text-xs" style={{ animationDelay: '0.1s' }}>Bütün mənbələr eyni anda yoxlanılır</p>
        </div>
        <div className="space-y-4">
          {sources.map(({ key, name, icon, found, color }) => (
            <div key={key} className="bg-white border border-border rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '18' }}>
                    <span style={{ color }}>{icon}</span>
                  </div>
                  <div>
                    <p className="font-600 text-sm text-text">{name}</p>
                    <p className="text-muted text-xs">{done[key] ? found : 'Axtarılır...'}</p>
                  </div>
                </div>
                {done[key] ? (
                  <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
                    <Check size={12} weight="bold" className="text-success" />
                  </div>
                ) : (
                  <span className="text-xs text-muted font-600">{Math.round(progress[key])}%</span>
                )}
              </div>
              <div className="h-1.5 bg-sand rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-150"
                  style={{ width: `${progress[key]}%`, backgroundColor: done[key] ? '#2F7D5C' : color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Filter Sheet ─────────────────────────────────────────────────────────────

interface FilterState {
  sources: string[]
  stars: number[]
  priceMax: number
  sortBy: 'price' | 'stars' | 'duration'
  directOnly: boolean
}

const DEFAULT_FILTERS: FilterState = {
  sources: ['Booking.com', 'Airbnb', 'Skyscanner'],
  stars: [3, 4, 5],
  priceMax: 2000,
  sortBy: 'price',
  directOnly: false,
}

function FilterSheet({ filters, onChange, onClose }: {
  filters: FilterState
  onChange: (f: FilterState) => void
  onClose: () => void
}) {
  const [local, setLocal] = useState<FilterState>(filters)

  const toggleSource = (s: string) =>
    setLocal(f => ({
      ...f,
      sources: f.sources.includes(s) ? f.sources.filter(x => x !== s) : [...f.sources, s],
    }))

  const toggleStar = (n: number) =>
    setLocal(f => ({
      ...f,
      stars: f.stars.includes(n) ? f.stars.filter(x => x !== n) : [...f.stars, n],
    }))

  const activeCount =
    (local.sources.length < 3 ? 1 : 0) +
    (local.stars.length < 3 ? 1 : 0) +
    (local.priceMax < 2000 ? 1 : 0) +
    (local.directOnly ? 1 : 0)

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-deep-navy/40 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Sheet — slides up from bottom on mobile, side panel on desktop */}
      <div className="fixed bottom-0 left-0 right-0 md:left-auto md:right-0 md:top-0 md:bottom-0 md:w-80 z-50 bg-white md:rounded-none rounded-t-3xl shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
        {/* Handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="font-700 text-text">Filter</h3>
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-gold text-deep-navy text-[10px] font-800 flex items-center justify-center">{activeCount}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocal(DEFAULT_FILTERS)}
              className="text-xs text-muted font-600 hover:text-navy transition-colors"
            >
              Sıfırla
            </button>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-sand flex items-center justify-center">
              <X size={14} className="text-muted" />
            </button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">

          {/* Sort */}
          <div>
            <p className="text-[10px] font-700 text-muted uppercase tracking-widest mb-3">Sıralama</p>
            <div className="grid grid-cols-3 gap-2">
              {([['price', 'Qiymət'], ['stars', 'Ulduz'], ['duration', 'Müddət']] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setLocal(f => ({ ...f, sortBy: val }))}
                  className={`py-2.5 rounded-xl text-xs font-600 border transition-all ${
                    local.sortBy === val
                      ? 'bg-navy text-ivory border-navy'
                      : 'bg-sand text-muted border-transparent hover:border-border'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Sources */}
          <div>
            <p className="text-[10px] font-700 text-muted uppercase tracking-widest mb-3">Mənbə</p>
            <div className="space-y-2">
              {['Booking.com', 'Airbnb', 'Skyscanner'].map(src => (
                <label key={src} className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        local.sources.includes(src) ? 'bg-navy border-navy' : 'border-border group-hover:border-navy/40'
                      }`}
                      onClick={() => toggleSource(src)}
                    >
                      {local.sources.includes(src) && <Check size={11} weight="bold" className="text-ivory" />}
                    </div>
                    <span className="text-sm font-500 text-text">{src}</span>
                  </div>
                  <SourceBadge source={src} />
                </label>
              ))}
            </div>
          </div>

          {/* Stars */}
          <div>
            <p className="text-[10px] font-700 text-muted uppercase tracking-widest mb-3">Ulduz dərəcəsi</p>
            <div className="flex gap-2">
              {[3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => toggleStar(n)}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${
                    local.stars.includes(n) ? 'border-gold bg-gold/5' : 'border-border bg-sand hover:border-gold/40'
                  }`}
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: n }).map((_, i) => (
                      <Star key={i} size={10} weight="fill" className={local.stars.includes(n) ? 'text-gold' : 'text-border'} />
                    ))}
                  </div>
                  <span className="text-[10px] font-600 text-muted">{n}+</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-700 text-muted uppercase tracking-widest">Maks. qiymət</p>
              <span className="text-sm font-700 text-text">${local.priceMax}</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={200}
                max={2000}
                step={50}
                value={local.priceMax}
                onChange={e => setLocal(f => ({ ...f, priceMax: Number(e.target.value) }))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #B5673D ${((local.priceMax - 200) / 1800) * 100}%, #DDD9D2 ${((local.priceMax - 200) / 1800) * 100}%)`
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-muted">$200</span>
              <span className="text-[10px] text-muted">$2000</span>
            </div>
          </div>

          {/* Direct only */}
          <div>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-600 text-text">Yalnız birbaşa uçuşlar</p>
                <p className="text-xs text-muted">Əyləşmə olmadan</p>
              </div>
              <div
                onClick={() => setLocal(f => ({ ...f, directOnly: !f.directOnly }))}
                className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${local.directOnly ? 'bg-navy' : 'bg-border'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${local.directOnly ? 'left-6' : 'left-1'}`} />
              </div>
            </label>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-5 py-4 border-t border-border">
          <button
            onClick={() => { onChange(local); onClose() }}
            className="w-full bg-navy hover:bg-navy/90 text-ivory font-700 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Check size={15} weight="bold" />
            Nəticələrə tətbiq et
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Desktop Filter Sidebar ───────────────────────────────────────────────────

function FilterSidebar({ filters, onChange, collapsed, onToggleCollapse }: {
  filters: FilterState
  onChange: (f: FilterState) => void
  collapsed: boolean
  onToggleCollapse: () => void
}) {
  const [local, setLocal] = useState<FilterState>(filters)

  const toggleSource = (s: string) =>
    setLocal(f => ({ ...f, sources: f.sources.includes(s) ? f.sources.filter(x => x !== s) : [...f.sources, s] }))

  const toggleStar = (n: number) =>
    setLocal(f => ({ ...f, stars: f.stars.includes(n) ? f.stars.filter(x => x !== n) : [...f.stars, n] }))

  const activeCount =
    (local.sources.length < 3 ? 1 : 0) +
    (local.stars.length < 3 ? 1 : 0) +
    (local.priceMax < 2000 ? 1 : 0) +
    (local.directOnly ? 1 : 0)

  useEffect(() => { setLocal(filters) }, [filters])

  // ── Collapsed strip ──
  if (collapsed) {
    return (
      <div className="hidden md:flex flex-col items-center pt-4 gap-3 bg-white border-r border-border shrink-0 self-stretch" style={{ width: 48 }}>
        <button
          onClick={onToggleCollapse}
          title="Filtri aç"
          className="w-9 h-9 rounded-xl bg-sand flex items-center justify-center hover:bg-border transition-all group"
        >
          <Funnel size={15} className={activeCount > 0 ? 'text-gold' : 'text-muted group-hover:text-navy'} />
        </button>
        {activeCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-gold text-deep-navy text-[9px] font-800 flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </div>
    )
  }

  // ── Expanded panel ──
  return (
    <div className="hidden md:flex flex-col bg-white border-r border-border shrink-0 self-stretch" style={{ width: 240 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Funnel size={14} className="text-navy" />
          <span className="text-sm font-700 text-text">Filter</span>
          {activeCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-gold text-deep-navy text-[9px] font-800 flex items-center justify-center">{activeCount}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {activeCount > 0 && (
            <button onClick={() => { setLocal(DEFAULT_FILTERS); onChange(DEFAULT_FILTERS) }} className="text-[10px] text-muted hover:text-error transition-colors font-600">
              Sıfırla
            </button>
          )}
          <button onClick={onToggleCollapse} className="w-6 h-6 rounded-lg bg-sand flex items-center justify-center hover:bg-border transition-colors">
            <ArrowLeft size={12} className="text-muted" />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">

        {/* Sort */}
        <div>
          <p className="text-[9px] font-700 text-muted uppercase tracking-widest mb-2.5">Sıralama</p>
          <div className="flex flex-col gap-1">
            {([['price', 'Qiymət'], ['stars', 'Ulduz'], ['duration', 'Müddət']] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => { setLocal(f => ({ ...f, sortBy: val })); onChange({ ...local, sortBy: val }) }}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-600 transition-all ${
                  local.sortBy === val ? 'bg-navy text-ivory' : 'text-muted hover:bg-sand hover:text-text'
                }`}
              >
                {label}
                {local.sortBy === val && <Check size={11} weight="bold" />}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Sources */}
        <div>
          <p className="text-[9px] font-700 text-muted uppercase tracking-widest mb-2.5">Mənbə</p>
          <div className="space-y-2">
            {['Booking.com', 'Airbnb', 'Skyscanner'].map(src => (
              <label key={src} className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-2.5">
                  <div
                    onClick={() => toggleSource(src)}
                    className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                      local.sources.includes(src) ? 'bg-navy border-navy' : 'border-border group-hover:border-navy/40'
                    }`}
                  >
                    {local.sources.includes(src) && <Check size={9} weight="bold" className="text-ivory" />}
                  </div>
                  <span className="text-xs font-500 text-text">{src}</span>
                </div>
                <SourceBadge source={src} />
              </label>
            ))}
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Stars */}
        <div>
          <p className="text-[9px] font-700 text-muted uppercase tracking-widest mb-2.5">Ulduz dərəcəsi</p>
          <div className="flex gap-1.5">
            {[3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => toggleStar(n)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all ${
                  local.stars.includes(n) ? 'border-gold bg-gold/5' : 'border-border bg-sand hover:border-gold/40'
                }`}
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: n }).map((_, i) => (
                    <Star key={i} size={9} weight="fill" className={local.stars.includes(n) ? 'text-gold' : 'text-border'} />
                  ))}
                </div>
                <span className="text-[9px] font-600 text-muted">{n}+</span>
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Price */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[9px] font-700 text-muted uppercase tracking-widest">Maks. qiymət</p>
            <span className="text-xs font-700 text-text">${local.priceMax}</span>
          </div>
          <input
            type="range" min={200} max={2000} step={50}
            value={local.priceMax}
            onChange={e => setLocal(f => ({ ...f, priceMax: Number(e.target.value) }))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, #B5673D ${((local.priceMax - 200) / 1800) * 100}%, #DDD9D2 ${((local.priceMax - 200) / 1800) * 100}%)` }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-muted">$200</span>
            <span className="text-[9px] text-muted">$2000</span>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Direct only */}
        <div>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-xs font-600 text-text">Birbaşa uçuşlar</p>
              <p className="text-[10px] text-muted">Əyləşmə olmadan</p>
            </div>
            <div
              onClick={() => setLocal(f => ({ ...f, directOnly: !f.directOnly }))}
              className={`w-9 h-5 rounded-full transition-all relative cursor-pointer ${local.directOnly ? 'bg-navy' : 'bg-border'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${local.directOnly ? 'left-4' : 'left-0.5'}`} />
            </div>
          </label>
        </div>
      </div>

      {/* Apply — pinned to bottom */}
      <div className="px-4 pt-3 pb-6 border-t border-border shrink-0">
        <button
          onClick={() => onChange(local)}
          className="w-full bg-navy hover:bg-navy/90 text-ivory font-700 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <Check size={12} weight="bold" />
          Tətbiq et
        </button>
      </div>
    </div>
  )
}

// ─── Screen 2b: Results ───────────────────────────────────────────────────────

function ResultsScreen({ onBuild, onBuilder }: { onBuild: () => void; onBuilder: () => void }) {
  const [activeTab, setActiveTab] = useState<'source' | 'all'>('source')
  const [sourceFilter, setSourceFilter] = useState('Hamısı')
  const [showMobileFilter, setShowMobileFilter] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)

  const activeFilterCount =
    (filters.sources.length < 3 ? 1 : 0) +
    (filters.stars.length < 3 ? 1 : 0) +
    (filters.priceMax < 2000 ? 1 : 0) +
    (filters.directOnly ? 1 : 0)

  const sortLabels = { price: 'Qiymət', stars: 'Ulduz', duration: 'Müddət' }

  // Card grid cols: fewer columns when sidebar is open (less space)
  const flightCols = sidebarCollapsed ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'
  const hotelCols  = sidebarCollapsed ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'
  const allCols    = sidebarCollapsed ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'

  return (
    <div className="min-h-screen bg-ivory pb-20 md:pb-0">
      {/* Mobile filter sheet */}
      {showMobileFilter && (
        <FilterSheet filters={filters} onChange={setFilters} onClose={() => setShowMobileFilter(false)} />
      )}

      {/* Sort dropdown */}
      {showSort && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowSort(false)} />
          <div className="fixed top-16 right-4 md:right-8 z-50 bg-white border border-border rounded-2xl shadow-xl overflow-hidden w-44">
            {(['price', 'stars', 'duration'] as const).map(val => (
              <button
                key={val}
                onClick={() => { setFilters(f => ({ ...f, sortBy: val })); setShowSort(false) }}
                className={`w-full px-4 py-3 text-left text-xs font-600 flex items-center justify-between transition-colors ${
                  filters.sortBy === val ? 'bg-sand text-navy' : 'text-muted hover:bg-sand/60'
                }`}
              >
                {sortLabels[val]}
                {filters.sortBy === val && <Check size={13} weight="bold" className="text-gold" />}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Sticky top bar */}
      <div className="bg-navy sticky top-0 z-20">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
          <IxTravelLogo light size="md" />

          <div className="hidden md:flex items-center gap-2 bg-ivory/10 hover:bg-ivory/15 transition-colors cursor-pointer rounded-xl px-4 py-2.5">
            <MapPin size={13} className="text-gold shrink-0" />
            <span className="text-ivory/80 text-sm font-500">Paris, Fransa</span>
            <span className="text-ivory/30 mx-1">·</span>
            <span className="text-ivory/80 text-sm font-500">12–17 Oktyabr</span>
            <span className="text-ivory/30 mx-1">·</span>
            <span className="text-ivory/80 text-sm font-500">2 nəfər</span>
          </div>

          <div className="md:hidden flex items-center gap-1.5 bg-ivory/10 rounded-lg px-2.5 py-1.5">
            <MapPin size={11} className="text-gold shrink-0" />
            <span className="text-ivory/80 text-[10px] font-500 truncate max-w-[140px]">Paris · 12–17 Okt · 2 nəfər</span>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setShowSort(v => !v)}
              className={`flex items-center gap-1.5 text-xs font-600 px-3.5 py-2 rounded-lg border transition-colors ${
                filters.sortBy !== 'price' ? 'border-gold text-gold bg-gold/10' : 'border-ivory/20 text-ivory/70 hover:border-ivory/40 hover:text-ivory'
              }`}
            >
              <SortAscending size={13} />
              {sortLabels[filters.sortBy]}
            </button>
            <button onClick={onBuilder} className="text-xs text-ivory/70 border border-ivory/20 px-3.5 py-2 rounded-lg hover:border-ivory/40 hover:text-ivory transition-colors font-500">
              Manual Builder
            </button>
            <button onClick={onBuild} className="flex items-center gap-1.5 bg-gold hover:bg-gold/90 text-deep-navy text-xs font-700 px-4 py-2 rounded-lg transition-colors">
              <Sparkle size={13} weight="fill" />Paket Qur
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar + content — locked-height flex row; each column scrolls independently */}
      <div className="hidden md:flex" style={{ height: 'calc(100vh - 57px)', overflow: 'hidden' }}>

        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(v => !v)}
        />

        {/* Results area — scrolls independently */}
        <div className="flex-1 min-w-0 overflow-y-auto h-full">
        <div className="px-5 md:px-8 pt-5">
        <div className="min-w-0">
          {/* Count + mobile actions */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-700 text-text">90 nəticə</h2>
              <p className="text-muted text-xs">3 mənbədən tapıldı</p>
            </div>
            <div className="flex md:hidden gap-1.5">
              <button
                onClick={() => setShowMobileFilter(true)}
                className={`flex items-center gap-1 text-[10px] font-600 px-2.5 py-2 rounded-lg border transition-colors ${
                  activeFilterCount > 0 ? 'border-gold text-gold bg-gold/5' : 'border-border text-muted'
                }`}
              >
                <Funnel size={11} />Filter
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-gold text-deep-navy text-[9px] font-800 flex items-center justify-center">{activeFilterCount}</span>
                )}
              </button>
              <button
                onClick={() => setShowSort(v => !v)}
                className={`flex items-center gap-1 text-[10px] font-600 px-2.5 py-2 rounded-lg border transition-colors ${
                  filters.sortBy !== 'price' ? 'border-navy text-navy bg-navy/5' : 'border-border text-muted'
                }`}
              >
                <SortAscending size={11} />{sortLabels[filters.sortBy]}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-sand rounded-xl p-1 mb-6 w-full md:w-64">
            {([['source', 'Mənbəyə görə'], ['all', 'Hamısı']] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 text-xs font-600 py-2 rounded-lg transition-all ${
                  activeTab === id ? 'bg-navy text-ivory shadow-sm' : 'text-muted hover:text-text'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'source' ? (
            <div className="space-y-10">
              {/* Flights */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-navy/8 flex items-center justify-center">
                    <AirplaneTakeoff size={15} className="text-navy" />
                  </div>
                  <div>
                    <h3 className="font-700 text-text text-sm">Uçuşlar</h3>
                    <p className="text-muted text-[10px]">12 nəticə</p>
                  </div>
                </div>
                <div className={`card-stagger grid grid-cols-1 ${flightCols} gap-4`}>
                  {FLIGHTS.map(f => (
                    <div key={f.id} className="bg-white border border-border rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 hover:border-navy/20 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <SourceBadge source={f.source} />
                        <span className="text-[10px] text-muted font-500">{f.airline}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="text-center flex-1">
                          <p className="text-xl font-800 text-text">{f.departure}</p>
                          <p className="text-[10px] text-muted font-600">{f.from}</p>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1">
                          <p className="text-[10px] text-muted">{f.duration}</p>
                          <div className="w-full flex items-center gap-1">
                            <div className="flex-1 h-px bg-border" />
                            <AirplaneTakeoff size={11} className="text-muted" />
                            <div className="flex-1 h-px bg-border" />
                          </div>
                          <span className="text-[10px] text-success font-600">Birbaşa</span>
                        </div>
                        <div className="text-center flex-1">
                          <p className="text-xl font-800 text-text">{f.arrival}</p>
                          <p className="text-[10px] text-muted font-600">{f.to}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div>
                          <span className="text-xl font-800 text-text">${f.price}</span>
                          <span className="text-[10px] text-muted ml-1">/ nəfər</span>
                        </div>
                        <button className="text-xs font-600 text-navy border border-navy/20 px-3 py-1.5 rounded-lg hover:bg-navy hover:text-ivory transition-colors">Seç</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Hotels */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-navy/8 flex items-center justify-center">
                    <Buildings size={15} className="text-navy" />
                  </div>
                  <div>
                    <h3 className="font-700 text-text text-sm">Otellər & Evlər</h3>
                    <p className="text-muted text-[10px]">78 nəticə</p>
                  </div>
                </div>
                <div className={`card-stagger grid grid-cols-1 ${hotelCols} gap-4`}>
                  {HOTELS.map(h => (
                    <div key={h.id} className="bg-white border border-border rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 hover:border-navy/20 transition-all">
                      <div className="relative h-36 bg-sand">
                        <img src={h.image} alt={h.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2"><SourceBadge source={h.source} /></div>
                      </div>
                      <div className="p-4">
                        <StarRating count={h.stars} />
                        <p className="font-700 text-sm text-text mt-1 leading-snug">{h.name}</p>
                        <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                          <MapPin size={10} />{h.location}
                        </p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                          <div>
                            <span className="text-xl font-800 text-text">${h.price}</span>
                            <span className="text-[10px] text-muted ml-1">{h.nights} gecə</span>
                          </div>
                          <button className="text-xs font-600 text-navy border border-navy/20 px-3 py-1.5 rounded-lg hover:bg-navy hover:text-ivory transition-colors">Seç</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <div>
              <div className="flex gap-1.5 mb-5 flex-wrap">
                {['Hamısı', 'Booking.com', 'Airbnb', 'Skyscanner'].map(f => (
                  <button
                    key={f}
                    onClick={() => setSourceFilter(f)}
                    className={`text-xs font-600 px-3 py-1.5 rounded-lg transition-colors ${
                      sourceFilter === f ? 'bg-navy text-ivory' : 'bg-white border border-border text-muted hover:border-navy hover:text-navy'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className={`grid grid-cols-1 ${allCols} gap-4`}>
                {[...HOTELS, ...FLIGHTS.map(f => ({
                  id: f.id, name: `${f.airline} · ${f.from}→${f.to}`, location: `${f.departure} – ${f.arrival}`,
                  stars: 0, nights: 0, price: f.price, source: f.source,
                  image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=260&fit=crop&auto=format'
                }))].filter(item => sourceFilter === 'Hamısı' || item.source === sourceFilter)
                  .map(item => (
                  <div key={item.id} className="bg-white border border-border rounded-2xl overflow-hidden hover:shadow-md hover:border-navy/20 transition-all">
                    <div className="relative h-32 bg-sand">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2"><SourceBadge source={item.source} /></div>
                    </div>
                    <div className="p-4">
                      {item.stars > 0 && <StarRating count={item.stars} />}
                      <p className="font-600 text-sm text-text mt-1">{item.name}</p>
                      <p className="text-xs text-muted">{item.location}</p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                        <span className="text-lg font-800 text-text">${item.price}</span>
                        <button className="text-xs font-600 text-navy border border-navy/20 px-3 py-1.5 rounded-lg hover:bg-navy hover:text-ivory transition-colors">Seç</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="h-12" />
        </div>
        </div>
        </div>
      </div>

      {/* Mobile content (same data, outside the locked flex row) */}
      <div className="md:hidden px-4 pt-5 pb-24">
          {/* Count + mobile actions */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-700 text-text">90 nəticə</h2>
              <p className="text-muted text-xs">3 mənbədən tapıldı</p>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => setShowMobileFilter(true)}
                className={`flex items-center gap-1 text-[10px] font-600 px-2.5 py-2 rounded-lg border transition-colors ${
                  (filters.sources.length < 3 || filters.stars.length < 3 || filters.priceMax < 2000 || filters.directOnly) ? 'border-gold text-gold bg-gold/5' : 'border-border text-muted'
                }`}
              >
                <Funnel size={11} />Filter
              </button>
              <button
                onClick={() => setShowSort(v => !v)}
                className={`flex items-center gap-1 text-[10px] font-600 px-2.5 py-2 rounded-lg border transition-colors ${
                  filters.sortBy !== 'price' ? 'border-navy text-navy bg-navy/5' : 'border-border text-muted'
                }`}
              >
                <SortAscending size={11} />{({ price: 'Qiymət', stars: 'Ulduz', duration: 'Müddət' } as const)[filters.sortBy]}
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {FLIGHTS.map(f => (
              <div key={f.id} className="bg-white border border-border rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <SourceBadge source={f.source} />
                  <span className="text-[10px] text-muted font-500">{f.airline}</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-center flex-1">
                    <p className="text-xl font-800 text-text">{f.departure}</p>
                    <p className="text-[10px] text-muted font-600">{f.from}</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <p className="text-[10px] text-muted">{f.duration}</p>
                    <div className="w-full flex items-center gap-1">
                      <div className="flex-1 h-px bg-border" />
                      <AirplaneTakeoff size={11} className="text-muted" />
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <span className="text-[10px] text-success font-600">Birbaşa</span>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-xl font-800 text-text">{f.arrival}</p>
                    <p className="text-[10px] text-muted font-600">{f.to}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div><span className="text-xl font-800 text-text">${f.price}</span><span className="text-[10px] text-muted ml-1">/ nəfər</span></div>
                  <button className="text-xs font-600 text-navy border border-navy/20 px-3 py-1.5 rounded-lg">Seç</button>
                </div>
              </div>
            ))}
            {HOTELS.map(h => (
              <div key={h.id} className="bg-white border border-border rounded-2xl overflow-hidden">
                <div className="relative h-36 bg-sand">
                  <img src={h.image} alt={h.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2"><SourceBadge source={h.source} /></div>
                </div>
                <div className="p-4">
                  <StarRating count={h.stars} />
                  <p className="font-700 text-sm text-text mt-1">{h.name}</p>
                  <p className="text-xs text-muted flex items-center gap-1 mt-0.5"><MapPin size={10} />{h.location}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div><span className="text-xl font-800 text-text">${h.price}</span><span className="text-[10px] text-muted ml-1">{h.nights} gecə</span></div>
                    <button className="text-xs font-600 text-navy border border-navy/20 px-3 py-1.5 rounded-lg">Seç</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
      </div>

      {/* Mobile-only sticky bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-border px-4 py-3 flex items-center gap-3">
        <button onClick={onBuilder} className="flex-1 flex items-center justify-center gap-1.5 border border-border text-navy text-xs font-600 py-3 rounded-xl">
          <ListBullets size={14} />Manual Builder
        </button>
        <button onClick={onBuild} className="flex-1 flex items-center justify-center gap-1.5 bg-gold text-deep-navy text-xs font-700 py-3 rounded-xl">
          <Sparkle size={14} weight="fill" />Paket Qur
        </button>
      </div>
    </div>
  )
}

// ─── Screen 3: Packages ───────────────────────────────────────────────────────

function PackagesScreen({ onBack, onBuilder }: { onBack: () => void; onBuilder: () => void }) {
  const packages = [
    {
      id: 'cheap', label: 'Ən Ucuz', recommended: false,
      flight: { airline: 'AZAL', route: 'BAK→CDG', time: '06:40 – 09:55' },
      hotel: { name: 'Montmartre Studio', stars: 4, nights: 5 },
      transfer: 'Şəxsi avtomobil',
      price: 870, perPerson: 435,
      borderClass: 'border-border', badgeText: null as string | null,
    },
    {
      id: 'best', label: 'Ən Sərfəli', recommended: true,
      flight: { airline: 'Turkish Airlines', route: 'BAK→CDG', time: '13:20 – 17:05' },
      hotel: { name: 'Hôtel Lutetia', stars: 5, nights: 5 },
      transfer: 'Business sedan',
      price: 1690, perPerson: 845,
      borderClass: 'border-gold', badgeText: 'Tövsiyə edilir',
    },
    {
      id: 'premium', label: 'Premium', recommended: false,
      flight: { airline: 'Lufthansa Business', route: 'BAK→CDG', time: '08:15 – 13:40' },
      hotel: { name: 'Plaza Athénée', stars: 5, nights: 5 },
      transfer: 'Premium SUV',
      price: 2505, perPerson: 1252,
      borderClass: 'border-border', badgeText: null,
    },
  ]

  return (
    <div className="min-h-screen bg-ivory pb-10">
      {/* Top bar */}
      <div className="bg-navy sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-ivory/60 hover:text-ivory transition-colors">
              <ArrowLeft size={18} />
            </button>
            <IxTravelLogo light size="md" />
          </div>
          <div className="hidden md:flex items-center gap-2 bg-ivory/10 rounded-xl px-4 py-2">
            <MapPin size={13} className="text-gold" />
            <span className="text-ivory/80 text-sm font-500">Paris, Fransa · 12–17 Oktyabr · 2 nəfər</span>
          </div>
          <button onClick={onBuilder} className="text-xs text-ivory/70 border border-ivory/20 px-3.5 py-2 rounded-lg hover:border-ivory/40 hover:text-ivory transition-colors font-500">
            Manual Builder
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-10">
        <div className="text-center mb-10">
          <p className="anim-fade-up text-gold text-[10px] font-600 tracking-[0.2em] uppercase mb-3" style={{ animationDelay: '0.05s' }}>AI tövsiyəsi</p>
          <h2 className="anim-fade-up text-3xl md:text-4xl font-800 text-text mb-2" style={{ animationDelay: '0.15s' }}>3 paket hazırlandı</h2>
          <p className="anim-fade-up text-muted text-sm" style={{ animationDelay: '0.25s' }}>Paris · 12–17 Oktyabr · 2 nəfər</p>
        </div>

        {/* Desktop: 3-col grid. Mobile: stacked */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {packages.map((pkg, i) => (
            <div
              key={pkg.id}
              className={`anim-fade-up bg-white rounded-2xl border-2 ${pkg.borderClass} relative flex flex-col ${
                pkg.recommended ? 'anim-glow-gold md:-mt-3 md:mb-3' : 'shadow-sm'
              }`}
              style={{ animationDelay: `${0.1 + i * 0.12}s` }}
            >
              {/* Recommended badge */}
              {pkg.badgeText && (
                <div className="bg-gold/10 border-b border-gold/20 py-2.5 text-center rounded-t-[14px]">
                  <span className="text-xs font-700 text-gold tracking-widest uppercase">{pkg.badgeText}</span>
                </div>
              )}

              <div className="p-5 md:p-6 flex flex-col flex-1">
                {/* Label + price */}
                <div className="mb-5">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-base font-700 text-text">{pkg.label}</h3>
                    {pkg.recommended && (
                      <span className="text-[10px] font-600 text-success bg-success/10 px-2 py-0.5 rounded-full">En yaxşı dəyər</span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-800 text-text">${pkg.price}</span>
                    <span className="text-xs text-muted">· ${pkg.perPerson} / nəfər</span>
                  </div>
                </div>

                {/* Detail blocks — stacked vertically on desktop card */}
                <div className="space-y-2.5 flex-1 mb-5">
                  <div className="bg-sand rounded-xl p-3.5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                      <AirplaneTakeoff size={15} className="text-navy" />
                    </div>
                    <div>
                      <p className="text-[9px] font-700 text-muted uppercase tracking-wider">Uçuş</p>
                      <p className="text-sm font-600 text-text">{pkg.flight.airline}</p>
                      <p className="text-xs text-muted">{pkg.flight.route} · {pkg.flight.time}</p>
                    </div>
                  </div>
                  <div className="bg-sand rounded-xl p-3.5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                      <Buildings size={15} className="text-navy" />
                    </div>
                    <div>
                      <p className="text-[9px] font-700 text-muted uppercase tracking-wider">Otel</p>
                      <p className="text-sm font-600 text-text">{pkg.hotel.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <StarRating count={pkg.hotel.stars} />
                        <span className="text-xs text-muted">{pkg.hotel.nights} gecə</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-sand rounded-xl p-3.5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                      <Car size={15} className="text-navy" />
                    </div>
                    <div>
                      <p className="text-[9px] font-700 text-muted uppercase tracking-wider">Transfer</p>
                      <p className="text-sm font-600 text-text">{pkg.transfer}</p>
                      <p className="text-xs text-muted">CDG → Otel</p>
                    </div>
                  </div>
                </div>

                {/* CTA buttons */}
                <div className="flex flex-col gap-2">
                  <button className={`w-full text-sm font-700 py-3 rounded-xl transition-all ${
                    pkg.recommended ? 'bg-gold hover:bg-gold/90 text-deep-navy' : 'bg-navy hover:bg-navy/90 text-ivory'
                  }`}>
                    Seç
                  </button>
                  <button className="w-full text-sm font-500 text-muted border border-border py-2.5 rounded-xl hover:border-navy hover:text-navy transition-colors">
                    Detallara bax
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-muted text-sm mt-10">
          Öz paketinizi qurun?{' '}
          <button onClick={onBuilder} className="text-gold font-600 hover:underline">Manual Builder →</button>
        </p>
      </div>
    </div>
  )
}

// ─── Screen 4: Manual Builder ─────────────────────────────────────────────────

type BuilderTab = 'list' | 'canvas'
interface DropSlot { type: 'flight' | 'hotel' | 'transfer'; item: FlightCard | HotelCard | TransferCard | null }

function ManualBuilder({ onBack }: { onBack: () => void }) {
  const [mobileTab, setMobileTab] = useState<BuilderTab>('list')
  const [sourceFilter, setSourceFilter] = useState('Hamısı')
  const [slots, setSlots] = useState<DropSlot[]>([
    { type: 'flight', item: null },
    { type: 'hotel', item: null },
    { type: 'transfer', item: null },
  ])
  const [dragItem, setDragItem] = useState<{ type: string; item: any } | null>(null)
  const [overSlot, setOverSlot] = useState<number | null>(null)
  const [sent, setSent] = useState(false)

  const allItems = [
    ...FLIGHTS.map(f => ({ type: 'flight', item: f })),
    ...HOTELS.map(h => ({ type: 'hotel', item: h })),
    ...TRANSFERS.map(t => ({ type: 'transfer', item: t })),
  ]
  const filtered = allItems.filter(({ item }) => sourceFilter === 'Hamısı' || item.source === sourceFilter)

  const total = slots.reduce((sum, s) => sum + (s.item?.price ?? 0), 0)
  const allFilled = slots.every(s => s.item !== null)
  const filledCount = slots.filter(s => s.item !== null).length

  const slotMeta = {
    flight: { icon: <AirplaneTakeoff size={16} className="text-navy/40" />, label: 'Uçuş', iconFill: <AirplaneTakeoff size={16} weight="fill" className="text-gold" /> },
    hotel: { icon: <Buildings size={16} className="text-navy/40" />, label: 'Otel', iconFill: <Buildings size={16} weight="fill" className="text-gold" /> },
    transfer: { icon: <Car size={16} className="text-navy/40" />, label: 'Transfer', iconFill: <Car size={16} weight="fill" className="text-gold" /> },
  }

  const handleDrop = (idx: number) => {
    if (!dragItem || slots[idx].type !== dragItem.type) return
    const next = [...slots]
    next[idx] = { ...slots[idx], item: dragItem.item }
    setSlots(next)
    setDragItem(null)
    setOverSlot(null)
  }

  const removeSlot = (idx: number) => {
    const next = [...slots]
    next[idx] = { ...next[idx], item: null }
    setSlots(next)
  }

  // Mobile: tapping a list item adds it to the first empty matching slot
  const addItemMobile = (type: string, item: any) => {
    const idx = slots.findIndex(s => s.type === type && s.item === null)
    if (idx === -1) return
    const next = [...slots]
    next[idx] = { ...slots[idx], item }
    setSlots(next)
    setMobileTab('canvas')
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col pb-24">
      {/* Top bar */}
      <div className="bg-navy sticky top-0 z-20 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-ivory/60 mr-1"><ArrowLeft size={18} /></button>
          <IxTravelLogo light size="sm" />
          <span className="text-ivory/40 text-[10px] ml-1">· Builder</span>
        </div>
        {total > 0 && (
          <div className="flex items-center gap-1.5 bg-ivory/10 rounded-lg px-2.5 py-1.5">
            <span className="text-ivory/60 text-[10px]">Cəm:</span>
            <span className="text-gold font-800 text-sm">${total}</span>
          </div>
        )}
      </div>

      {/* Mobile tab switcher (hidden on md+) */}
      <div className="md:hidden flex gap-1 bg-sand m-4 rounded-xl p-1">
        <button
          onClick={() => setMobileTab('list')}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-600 py-2.5 rounded-lg transition-all ${mobileTab === 'list' ? 'bg-navy text-ivory shadow-sm' : 'text-muted'}`}
        >
          <ListBullets size={14} />Siyahı
        </button>
        <button
          onClick={() => setMobileTab('canvas')}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-600 py-2.5 rounded-lg transition-all ${mobileTab === 'canvas' ? 'bg-navy text-ivory shadow-sm' : 'text-muted'}`}
        >
          <Basket size={14} />
          Paket
          {filledCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-gold text-deep-navy text-[9px] font-800 flex items-center justify-center">{filledCount}</span>
          )}
        </button>
      </div>

      {/* Desktop: two-column / Mobile: tabs */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 px-4 md:px-6">

        {/* Left / List panel */}
        <div className={`${mobileTab === 'list' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 shrink-0`}>
          <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col flex-1">
            <div className="p-3.5 border-b border-border">
              <p className="font-700 text-xs text-text mb-2.5">Seçin & Əlavə edin</p>
              <div className="flex flex-wrap gap-1.5">
                {['Hamısı', 'Booking.com', 'Airbnb', 'Skyscanner'].map(f => (
                  <button
                    key={f}
                    onClick={() => setSourceFilter(f)}
                    className={`text-[10px] font-600 px-2 py-1 rounded-lg transition-colors ${sourceFilter === f ? 'bg-navy text-ivory' : 'bg-sand text-muted'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="card-stagger divide-y divide-border overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 280px)' }}>
              {filtered.map(({ type, item }) => {
                const meta = slotMeta[type as keyof typeof slotMeta]
                const label = type === 'flight'
                  ? `${(item as FlightCard).airline} · ${(item as FlightCard).from}→${(item as FlightCard).to}`
                  : type === 'hotel' ? (item as HotelCard).name
                  : (item as TransferCard).type
                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => setDragItem({ type, item })}
                    onClick={() => addItemMobile(type, item)}
                    className="p-3 flex items-center gap-2.5 cursor-pointer hover:bg-sand/60 transition-colors active:scale-[0.98] select-none"
                  >
                    <DotsSixVertical size={12} className="text-border shrink-0 hidden md:block" />
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${type === 'flight' ? 'bg-navy/8' : type === 'hotel' ? 'bg-sand' : 'bg-success/8'}`}>
                      {type === 'flight' ? <AirplaneTakeoff size={13} className="text-navy" /> : type === 'hotel' ? <Buildings size={13} className="text-navy" /> : <Car size={13} className="text-success" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-600 text-text truncate">{label}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <SourceBadge source={item.source} />
                        <span className="text-[10px] font-700 text-text">${item.price}</span>
                      </div>
                    </div>
                    <div className="md:hidden shrink-0">
                      <span className="text-[10px] text-gold font-600">+ Əlavə et</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right / Canvas panel */}
        <div className={`${mobileTab === 'canvas' ? 'flex' : 'hidden'} md:flex flex-col flex-1`}>
          <div className="bg-white border border-border rounded-2xl p-4 md:p-5 shadow-sm flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-700 text-sm text-text">Paketiniz</h3>
                <p className="text-muted text-xs">Paris · 12–17 Oktyabr · 2 nəfər</p>
              </div>
              {total > 0 && (
                <div className="bg-sand rounded-xl px-3 py-2 text-right">
                  <p className="text-[9px] text-muted font-600 uppercase tracking-wider">Cəm</p>
                  <p className="text-xl font-800 text-text">${total}</p>
                </div>
              )}
            </div>

            <div className="space-y-3 flex-1">
              {slots.map((slot, idx) => {
                const meta = slotMeta[slot.type]
                return (
                  <div
                    key={idx}
                    onDragOver={e => { e.preventDefault(); setOverSlot(idx) }}
                    onDragLeave={() => setOverSlot(null)}
                    onDrop={() => handleDrop(idx)}
                    className={`rounded-2xl border-2 border-dashed transition-all ${
                      overSlot === idx && dragItem?.type === slot.type
                        ? 'border-gold bg-gold/5'
                        : slot.item ? 'border-transparent bg-sand' : 'border-border'
                    }`}
                  >
                    {slot.item ? (
                      <div className="p-3.5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-navy flex items-center justify-center shrink-0">
                          {meta.iconFill}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[9px] font-700 text-muted uppercase tracking-wider">{meta.label}</span>
                            <SourceBadge source={slot.item.source} />
                          </div>
                          <p className="font-600 text-xs text-text truncate">
                            {slot.type === 'flight' ? `${(slot.item as FlightCard).airline} · ${(slot.item as FlightCard).from}→${(slot.item as FlightCard).to}` :
                             slot.type === 'hotel' ? (slot.item as HotelCard).name :
                             (slot.item as TransferCard).type}
                          </p>
                          <p className="text-[10px] text-muted truncate">
                            {slot.type === 'flight' ? `${(slot.item as FlightCard).departure} – ${(slot.item as FlightCard).arrival}` :
                             slot.type === 'hotel' ? `${(slot.item as HotelCard).nights} gecə · ${(slot.item as HotelCard).location}` :
                             `${(slot.item as TransferCard).from} → ${(slot.item as TransferCard).to}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-base font-800 text-text">${slot.item.price}</span>
                          <button onClick={() => removeSlot(idx)} className="text-muted hover:text-error transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-7 flex flex-col items-center gap-1.5 text-center">
                        {meta.icon}
                        <p className="text-[10px] text-muted/60 font-500">
                          {meta.label} buraya sürüşdürün
                          <span className="block text-[9px] md:hidden text-muted/40">və ya siyahıdan seçin</span>
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Success modal */}
      {sent && (
        <div className="fixed inset-0 bg-deep-navy/70 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-7 w-full max-w-sm text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
              <Check size={24} weight="bold" className="text-success" />
            </div>
            <h3 className="text-lg font-800 text-text mb-1.5">Göndərildi!</h3>
            <p className="text-muted text-sm mb-6">Paketiniz agent panelinə göndərildi.</p>
            <button onClick={() => { setSent(false); onBack() }} className="w-full bg-navy text-ivory font-700 py-3 rounded-xl">
              Qayıt
            </button>
          </div>
        </div>
      )}

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-border px-4 py-3 flex items-center gap-3">
        {total > 0 ? (
          <div className="flex-1">
            <p className="text-[10px] text-muted font-500">{filledCount}/3 seçildi · Cəm</p>
            <p className="text-lg font-800 text-text leading-none">${total}</p>
          </div>
        ) : (
          <p className="flex-1 text-xs text-muted">Hər 3 elementi seçin</p>
        )}
        <button
          onClick={() => allFilled && setSent(true)}
          disabled={!allFilled}
          className={`flex items-center gap-2 text-xs font-700 px-5 py-3.5 rounded-xl transition-all ${
            allFilled ? 'bg-gold text-deep-navy' : 'bg-sand text-muted/50'
          }`}
        >
          <PaperPlaneTilt size={14} weight="fill" />
          Göndər
        </button>
      </div>
    </div>
  )
}

// ─── Screen transition wrapper ────────────────────────────────────────────────

function FadeScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="anim-fade-in" style={{ animationDuration: '0.35s' }}>
      {children}
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>('search')

  return (
    <FadeScreen key={screen}>
      {screen === 'search' && <SearchScreen onSearch={() => setScreen('loading')} />}
      {screen === 'loading' && <LoadingScreen onDone={() => setScreen('results')} />}
      {screen === 'results' && <ResultsScreen onBuild={() => setScreen('packages')} onBuilder={() => setScreen('builder')} />}
      {screen === 'packages' && <PackagesScreen onBack={() => setScreen('results')} onBuilder={() => setScreen('builder')} />}
      {screen === 'builder' && <ManualBuilder onBack={() => setScreen('packages')} />}
    </FadeScreen>
  )
}
