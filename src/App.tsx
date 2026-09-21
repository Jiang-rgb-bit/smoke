import { useState } from 'react'
import {
  ArrowUpRight, ChevronRight, CircleHelp, Clock3, Flame, Globe2, History,
  Home, Leaf, Menu, Moon, Plus, Settings, Sparkles, Wind,
} from 'lucide-react'
import { Link, NavLink, Route, Routes } from 'react-router-dom'
import './App.css'

type NavItem = { to: string; label: string; icon: typeof Home }
const navItems: NavItem[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/simulate', label: 'Simulate', icon: Wind },
  { to: '/create', label: 'Create', icon: Plus },
  { to: '/history', label: 'History', icon: History },
]

function SmokeMark({ compact = false }: { compact?: boolean }) {
  return <div className={`smoke-mark ${compact ? 'smoke-mark--compact' : ''}`} aria-hidden="true">
    <span className="smoke-mark__line smoke-mark__line--one" /><span className="smoke-mark__line smoke-mark__line--two" />
    <span className="smoke-mark__ember" /><span className="smoke-mark__body" />
  </div>
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="app-shell">
    <aside className="sidebar">
      <Link className="brand" to="/"><span className="brand__mark"><SmokeMark compact /></span><span>Smoke Air</span></Link>
      <div className="sidebar__rule" />
      <nav className="sidebar__nav" aria-label="Main navigation"><span className="eyebrow">Your space</span>
        {navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}><Icon size={17} strokeWidth={1.8} /><span>{label}</span>{label === 'Create' && <span className="nav-link__new">New</span>}</NavLink>)}
      </nav>
      <div className="sidebar__footer"><NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}><Settings size={17} strokeWidth={1.8} /><span>Settings</span></NavLink><div className="sidebar__locale"><Globe2 size={15} /><span>English</span><ChevronRight size={14} /></div><p className="sidebar__note">A private digital ritual.<br />Nothing leaves this device.</p></div>
    </aside>
    <main className="main-content"><header className="mobile-header"><Link className="brand" to="/"><span className="brand__mark"><SmokeMark compact /></span><span>Smoke Air</span></Link><button className="icon-button" type="button" aria-label="Open menu"><Menu size={20} /></button></header>{children}</main>
  </div>
}

function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) { return <div className="page-header"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-header__description">{description}</p></div> }

function Home() {
  return <div className="page page--home"><div className="topbar"><span>Thursday, September 21</span><span className="topbar__status"><span className="status-dot" /> Local mode</span></div>
    <section className="home-intro"><div><p className="eyebrow">Good evening, stranger</p><h1>Make a little<br /><em>space.</em></h1><p className="home-intro__copy">A quiet place to slow down, notice the moment,<br className="desktop-only" /> and leave a feeling somewhere safe.</p></div><div className="home-intro__date"><Moon size={17} /><span>Night ritual<br /><strong>04:38</strong> remaining</span></div></section>
    <section className="hero-grid"><article className="hero-card hero-card--ritual"><div className="hero-card__top"><span className="label-pill"><span className="status-dot status-dot--amber" /> Recommended</span><span className="hero-card__index">01 / 03</span></div><div className="ritual-visual"><SmokeMark /><span className="smoke-cloud smoke-cloud--one" /><span className="smoke-cloud smoke-cloud--two" /><span className="smoke-cloud smoke-cloud--three" /></div><div className="hero-card__content"><p className="eyebrow">Tonight's ritual</p><h2>After the rain</h2><p>Seven minutes of warm light and drifting air.</p><Link className="button button--light" to="/simulate">Begin ritual <ArrowUpRight size={16} /></Link></div></article>
      <article className="hero-card hero-card--create"><div className="hero-card__top"><span className="label-pill label-pill--dark"><Sparkles size={13} /> Personal</span><span className="hero-card__index">Make yours</span></div><div className="create-visual"><div className="create-ring"><Plus size={30} strokeWidth={1.2} /></div></div><div className="hero-card__content"><p className="eyebrow">A small container for a big feeling</p><h2>Roll your own moment</h2><p>Shape a fictional cigarette, then tuck a mood inside.</p><Link className="text-link" to="/create">Start creating <ChevronRight size={15} /></Link></div></article></section>
    <section className="dashboard-lower"><div className="section-heading"><div><p className="eyebrow">Your atmosphere</p><h2>Small signals</h2></div><Link className="text-link" to="/insights">View insights <ArrowUpRight size={15} /></Link></div><div className="signal-grid"><div className="signal-card"><div className="signal-card__icon"><Clock3 size={17} /></div><span className="signal-card__label">This week</span><strong>03 <small>rituals</small></strong><div className="micro-bars"><i /><i /><i /><i /><i /><i /><i /></div></div><div className="signal-card signal-card--mood"><div className="signal-card__icon"><Leaf size={17} /></div><span className="signal-card__label">Most present mood</span><strong>Quietly <small>curious</small></strong><div className="mood-line"><span /><span /><span /><span /><span /></div></div><Link className="signal-card signal-card--history" to="/history"><div className="signal-card__icon"><History size={17} /></div><span className="signal-card__label">Last saved</span><strong>Late train</strong><span className="signal-card__link">Open memory <ArrowUpRight size={14} /></span></Link></div></section>
  </div>
}

function Simulate() {
  const [started, setStarted] = useState(false)
  return <div className="page page--inner"><PageHeader eyebrow="The simulator" title="Settle in." description="Choose a pace, light a fictional ritual, and give the next few minutes nowhere else to go." /><div className={`simulator-panel ${started ? 'simulator-panel--active' : ''}`}><div className="simulator-panel__visual"><SmokeMark /><span className="simulator-ring" /><span className="simulator-ring simulator-ring--two" /></div><div className="simulator-panel__copy"><span className="label-pill"><span className="status-dot status-dot--amber" /> Virtual experience</span><h2>{started ? 'The room is getting quieter.' : 'A moment, on your terms.'}</h2><p>{started ? 'Breathe normally. Let the atmosphere do the moving.' : 'No goal to reach. No perfect way to do this.'}</p><button className="button button--amber" type="button" onClick={() => setStarted(true)}>{started ? 'Ritual in progress' : 'Light the ritual'} <Flame size={16} /></button></div><div className="simulator-panel__meta"><span>07:00</span><span>{started ? '01:42 elapsed' : 'Suggested duration'}</span></div></div><div className="notice"><CircleHelp size={17} /><p>This is a fictional digital simulator. It does not provide real tobacco-making, nicotine, or health guidance.</p></div></div>
}

function Create() {
  const [mood, setMood] = useState('Quiet')
  return <div className="page page--inner"><PageHeader eyebrow="Create your own" title="Leave a feeling inside." description="Build a fictional keepsake for the mood you are carrying today." /><div className="creation-layout"><section className="creation-preview"><p className="eyebrow">Live preview</p><div className="creation-cigarette"><span className="creation-cigarette__filter" /><span className="creation-cigarette__paper" /><span className="creation-cigarette__ember" /></div><div className="creation-preview__caption"><span>Tonight's edition</span><strong>{mood} / 05</strong></div></section><section className="creation-form"><label>Name this moment<input type="text" defaultValue="A quiet place" /></label><div><span className="form-label">What are you carrying?</span><div className="mood-options">{['Quiet', 'Tired', 'Focused', 'Hopeful', 'Restless'].map((item) => <button type="button" className={mood === item ? 'is-selected' : ''} key={item} onClick={() => setMood(item)}>{item}</button>)}</div></div><label>Your note <span className="optional">Optional</span><textarea placeholder="A sentence for later..." rows={4} /></label><button className="button button--dark" type="button">Save this moment <ArrowUpRight size={16} /></button></section></div></div>
}

function HistoryPage() { return <div className="page page--inner"><PageHeader eyebrow="Your history" title="Things you kept." description="A private record of the moments you chose to notice." /><div className="history-list">{[['Late train', 'Focused', 'Yesterday · 11:42 PM'], ['After the rain', 'Quiet', 'Sep 18 · 08:16 PM'], ['First light', 'Hopeful', 'Sep 16 · 06:04 AM']].map(([title, mood, date], index) => <Link className="history-item" to="#" key={title}><div className={`history-item__number history-item__number--${index + 1}`}>0{index + 1}</div><div className="history-item__main"><h2>{title}</h2><span>{mood} mood</span></div><time>{date}</time><ChevronRight size={18} /></Link>)}</div></div> }
function SettingsPage() { return <div className="page page--inner"><PageHeader eyebrow="Preferences" title="Make it yours." description="The small details that shape your space." /><div className="settings-list"><div className="setting-row"><div><strong>Interface language</strong><span>English</span></div><button className="select-button" type="button">English <ChevronRight size={15} /></button></div><div className="setting-row"><div><strong>Reduced motion</strong><span>Keep ambient effects gentle</span></div><button className="toggle" type="button" aria-label="Reduced motion"><span /></button></div><div className="setting-row"><div><strong>Local data</strong><span>Your memories stay on this device</span></div><button className="text-link" type="button">Manage <ChevronRight size={15} /></button></div></div></div> }
function App() { return <Shell><Routes><Route path="/" element={<Home />} /><Route path="/simulate" element={<Simulate />} /><Route path="/create" element={<Create />} /><Route path="/history" element={<HistoryPage />} /><Route path="/settings" element={<SettingsPage />} /><Route path="*" element={<Home />} /></Routes></Shell> }
export default App
