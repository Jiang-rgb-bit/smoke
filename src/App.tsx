import { createContext, useContext, useEffect, useState } from 'react'
import {
  ArrowUpRight, ChevronRight, CircleHelp, Clock3, Flame, Globe2, History,
  Home, Leaf, Menu, Moon, Plus, Settings, Sparkles, Wind,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link, NavLink, useNavigate, useRoutes, type RouteObject } from 'react-router-dom'
import './App.css'

type Locale = 'en' | 'zh-CN'
type CopyKey = keyof typeof copy.en
type NavItem = { to: string; key: CopyKey; icon: LucideIcon }
const SESSION_DURATION = 7 * 60
const SESSION_STORAGE_KEY = 'smoke-air:v1:sessions'
const CREATION_STORAGE_KEY = 'smoke-air:v1:creations'

type SessionRecord = {
  id: string
  title: string
  mood: string
  elapsedSeconds: number
  completedAt: string
}

type CreationRecord = {
  id: string
  title: string
  mood: string
  note: string
  createdAt: string
}

function readStorage<T>(key: string): T[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function writeStorage<T>(key: string, records: T[]) {
  localStorage.setItem(key, JSON.stringify(records.slice(0, 30)))
}

function formatDate(value: string) {
  return value.includes('T') ? new Date(value).toLocaleString() : value
}

const copy = {
  en: {
    home: 'Home', simulate: 'Simulate', create: 'Create', history: 'History', settings: 'Settings', english: 'English', chinese: '中文',
    yourSpace: 'Your space', newLabel: 'New', localMode: 'Local mode', goodEvening: 'Good evening, stranger', makeSpace: 'Make a little', space: 'space.', homeCopy: 'A quiet place to slow down, notice the moment, and leave a feeling somewhere safe.', recommended: 'Recommended', personal: 'Personal', tonight: "Tonight's ritual", afterRain: 'After the rain', begin: 'Begin ritual', createPrompt: 'A small container for a big feeling', rollMoment: 'Roll your own moment', startCreating: 'Start creating', atmosphere: 'Your atmosphere', signals: 'Small signals', viewInsights: 'View insights',
    simulatorEyebrow: 'The simulator', settleIn: 'Settle in.', simulatorCopy: 'Choose a pace, light a fictional ritual, and give the next few minutes nowhere else to go.', virtual: 'Virtual experience', quietRoom: 'The room is getting quieter.', momentTerms: 'A moment, on your terms.', breathe: 'Breathe normally. Let the atmosphere do the moving.', noGoal: 'No goal to reach. No perfect way to do this.', light: 'Light the ritual', pause: 'Pause ritual', continue: 'Continue ritual', saveMoment: 'Save this moment', inProgress: 'In progress', paused: 'Paused', suggested: 'Suggested duration', fictionalNotice: 'This is a fictional digital simulator. It does not provide real tobacco-making, nicotine, or health guidance.',
    createEyebrow: 'Create your own', leaveFeeling: 'Leave a feeling inside.', createCopy: 'Build a fictional keepsake for the mood you are carrying today.', livePreview: 'Live preview', nameMoment: 'Name this moment', carrying: 'What are you carrying?', note: 'Your note', optional: 'Optional', notePlaceholder: 'A sentence for later...', saved: 'Saved to history', openHistory: 'Open history',
    historyEyebrow: 'Your history', thingsKept: 'Things you kept.', historyCopy: 'A private record of the moments you chose to notice.', ritual: 'Ritual', mood: 'mood',
    preferences: 'Preferences', makeYours: 'Make it yours.', preferencesCopy: 'The small details that shape your space.', interfaceLanguage: 'Interface language', reducedMotion: 'Reduced motion', gentleEffects: 'Keep ambient effects gentle', localData: 'Local data', dataCopy: 'Your memories stay on this device', manage: 'Manage',
  },
  'zh-CN': {
    home: '首页', simulate: '模拟', create: '创作', history: '记录', settings: '设置', english: 'English', chinese: '中文', yourSpace: '你的空间', newLabel: '新的', localMode: '本地模式', goodEvening: '晚上好，陌生人', makeSpace: '给自己留一点', space: '空间。', homeCopy: '一个放慢脚步、留意当下，把心情安放在安全之处的安静地方。', recommended: '推荐', personal: '私人', tonight: '今晚的仪式', afterRain: '雨后', begin: '开始仪式', createPrompt: '为复杂心情留一个小容器', rollMoment: '卷起属于你的时刻', startCreating: '开始创作', atmosphere: '你的氛围', signals: '微小信号', viewInsights: '查看洞察',
    simulatorEyebrow: '模拟器', settleIn: '安静下来。', simulatorCopy: '选择一个节奏，点亮虚拟仪式，让接下来的几分钟不必去往别处。', virtual: '虚拟体验', quietRoom: '房间正在安静下来。', momentTerms: '这一刻，由你决定。', breathe: '正常呼吸，让氛围自己流动。', noGoal: '没有目标，也没有唯一正确的方式。', light: '点亮仪式', pause: '暂停仪式', continue: '继续仪式', saveMoment: '保存这一刻', inProgress: '进行中', paused: '已暂停', suggested: '建议时长', fictionalNotice: '这是一个虚拟数字模拟器，不提供真实卷烟制作、尼古丁或健康指导。',
    createEyebrow: '创作属于你的', leaveFeeling: '把一种心情留在里面。', createCopy: '为你今天带着的情绪，制作一个虚拟的纪念物。', livePreview: '实时预览', nameMoment: '为这一刻命名', carrying: '你此刻带着什么？', note: '你的笔记', optional: '可选', notePlaceholder: '留一句话给未来的自己……', saved: '已保存到记录', openHistory: '打开记录',
    historyEyebrow: '你的记录', thingsKept: '你留下的时刻。', historyCopy: '一份只属于你的、关于被认真感受过的时刻的记录。', ritual: '仪式', mood: '心情',
    preferences: '偏好', makeYours: '让它属于你。', preferencesCopy: '塑造你的私人空间的小细节。', interfaceLanguage: '界面语言', reducedMotion: '减少动效', gentleEffects: '让氛围效果更柔和', localData: '本地数据', dataCopy: '你的记忆只保存在这台设备上', manage: '管理',
  },
} as const

const LocaleContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void; t: (key: CopyKey) => string } | null>(null)
function useLocale() {
  const value = useContext(LocaleContext)
  if (!value) throw new Error('useLocale must be used inside LocaleContext')
  return value
}
const navItems: NavItem[] = [
  { to: '/', key: 'home', icon: Home },
  { to: '/simulate', key: 'simulate', icon: Wind },
  { to: '/create', key: 'create', icon: Plus },
  { to: '/history', key: 'history', icon: History },
]

function SmokeMark({ compact = false }: { compact?: boolean }) {
  return <div className={`smoke-mark ${compact ? 'smoke-mark--compact' : ''}`} aria-hidden="true">
    <span className="smoke-mark__line smoke-mark__line--one" /><span className="smoke-mark__line smoke-mark__line--two" />
    <span className="smoke-mark__ember" /><span className="smoke-mark__body" />
  </div>
}

function Shell({ children }: { children: React.ReactNode }) {
  const { t } = useLocale()
  const [menuOpen, setMenuOpen] = useState(false)
  return <div className="app-shell">
    <aside className="sidebar">
      <Link className="brand" to="/"><span className="brand__mark"><SmokeMark compact /></span><span>Smoke Air</span></Link>
      <div className="sidebar__rule" />
      <nav className="sidebar__nav" aria-label="Main navigation"><span className="eyebrow">Your space</span>
        {navItems.map(({ to, key, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}><Icon size={17} strokeWidth={1.8} /><span>{t(key)}</span>{key === 'create' && <span className="nav-link__new">{t('newLabel')}</span>}</NavLink>)}
      </nav>
      <div className="sidebar__footer"><NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}><Settings size={17} strokeWidth={1.8} /><span>{t('settings')}</span></NavLink><div className="sidebar__locale"><Globe2 size={15} /><span>{t('english')}</span><ChevronRight size={14} /></div><p className="sidebar__note">A private digital ritual.<br />Nothing leaves this device.</p></div>
    </aside>
    <main className="main-content"><header className="mobile-header"><Link className="brand" to="/"><span className="brand__mark"><SmokeMark compact /></span><span>Smoke Air</span></Link><button className="icon-button" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen((open) => !open)}><Menu size={20} /></button></header>{menuOpen && <nav className="mobile-nav" aria-label="Mobile navigation">{navItems.map(({ to, key, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} className="nav-link"><Icon size={17} /><span>{t(key)}</span></NavLink>)}<NavLink to="/settings" onClick={() => setMenuOpen(false)} className="nav-link"><Settings size={17} /><span>{t('settings')}</span></NavLink></nav>}{children}</main>
  </div>
}

function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) { return <div className="page-header"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-header__description">{description}</p></div> }

function Dashboard() {
  const { t } = useLocale()
  return <div className="page page--home"><div className="topbar"><span>Thursday, September 21</span><span className="topbar__status"><span className="status-dot" /> {t('localMode')}</span></div>
    <section className="home-intro"><div><p className="eyebrow">{t('goodEvening')}</p><h1>{t('makeSpace')}<br /><em>{t('space')}</em></h1><p className="home-intro__copy">{t('homeCopy')}</p></div><div className="home-intro__date"><Moon size={17} /><span>Night ritual<br /><strong>04:38</strong> remaining</span></div></section>
    <section className="hero-grid"><article className="hero-card hero-card--ritual"><div className="hero-card__top"><span className="label-pill"><span className="status-dot status-dot--amber" /> {t('recommended')}</span><span className="hero-card__index">01 / 03</span></div><div className="ritual-visual"><SmokeMark /><span className="smoke-cloud smoke-cloud--one" /><span className="smoke-cloud smoke-cloud--two" /><span className="smoke-cloud smoke-cloud--three" /></div><div className="hero-card__content"><p className="eyebrow">{t('tonight')}</p><h2>{t('afterRain')}</h2><p>Seven minutes of warm light and drifting air.</p><Link className="button button--light" to="/simulate">{t('begin')} <ArrowUpRight size={16} /></Link></div></article>
      <article className="hero-card hero-card--create"><div className="hero-card__top"><span className="label-pill label-pill--dark"><Sparkles size={13} /> {t('personal')}</span><span className="hero-card__index">{t('makeYours')}</span></div><div className="create-visual"><div className="create-ring"><Plus size={30} strokeWidth={1.2} /></div></div><div className="hero-card__content"><p className="eyebrow">{t('createPrompt')}</p><h2>{t('rollMoment')}</h2><p>Shape a fictional keepsake, then tuck a mood inside.</p><Link className="text-link" to="/create">{t('startCreating')} <ChevronRight size={15} /></Link></div></article></section>
    <section className="dashboard-lower"><div className="section-heading"><div><p className="eyebrow">{t('atmosphere')}</p><h2>{t('signals')}</h2></div><Link className="text-link" to="/insights">{t('viewInsights')} <ArrowUpRight size={15} /></Link></div><div className="signal-grid"><div className="signal-card"><div className="signal-card__icon"><Clock3 size={17} /></div><span className="signal-card__label">This week</span><strong>03 <small>rituals</small></strong><div className="micro-bars"><i /><i /><i /><i /><i /><i /><i /></div></div><div className="signal-card signal-card--mood"><div className="signal-card__icon"><Leaf size={17} /></div><span className="signal-card__label">Most present mood</span><strong>Quietly <small>curious</small></strong><div className="mood-line"><span /><span /><span /><span /><span /></div></div><Link className="signal-card signal-card--history" to="/history"><div className="signal-card__icon"><History size={17} /></div><span className="signal-card__label">Last saved</span><strong>Late train</strong><span className="signal-card__link">Open memory <ArrowUpRight size={14} /></span></Link></div></section>
  </div>
}

function Simulate() {
  const { t } = useLocale()
  const navigate = useNavigate()
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return undefined
    const timer = window.setInterval(() => {
      setElapsed((current) => {
        if (current >= SESSION_DURATION - 1) {
          setRunning(false)
          return SESSION_DURATION
        }
        return current + 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [running])

  const finishSession = () => {
    const existing = readStorage<SessionRecord>(SESSION_STORAGE_KEY)
    existing.unshift({ id: crypto.randomUUID(), title: 'After the rain', mood: 'Quiet', elapsedSeconds: elapsed, completedAt: new Date().toISOString() })
    writeStorage(SESSION_STORAGE_KEY, existing)
    navigate('/history')
  }

  const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0')
  const seconds = (elapsed % 60).toString().padStart(2, '0')
  return <div className="page page--inner"><PageHeader eyebrow={t('simulatorEyebrow')} title={t('settleIn')} description={t('simulatorCopy')} /><div className={`simulator-panel ${running ? 'simulator-panel--active' : ''}`}><div className="simulator-panel__visual"><SmokeMark /><span className="simulator-ring" /><span className="simulator-ring simulator-ring--two" /></div><div className="simulator-panel__copy"><span className="label-pill"><span className="status-dot status-dot--amber" /> {t('virtual')}</span><h2>{running ? t('quietRoom') : elapsed ? t('saveMoment') : t('momentTerms')}</h2><p>{running ? t('breathe') : elapsed ? t('paused') : t('noGoal')}</p><div className="simulator-actions"><button className="button button--amber" type="button" onClick={() => setRunning((current) => !current)}>{running ? t('pause') : elapsed ? t('continue') : t('light')} <Flame size={16} /></button>{elapsed > 0 && <button className="text-link" type="button" onClick={finishSession}>{t('saveMoment')} <ArrowUpRight size={15} /></button>}</div></div><div className="simulator-panel__meta"><span>{minutes}:{seconds} / 07:00</span><span>{running ? t('inProgress') : elapsed ? t('paused') : t('suggested')}</span></div></div><div className="notice"><CircleHelp size={17} /><p>{t('fictionalNotice')}</p></div></div>
}

function Create() {
  const { t } = useLocale()
  const [mood, setMood] = useState('Quiet')
  const navigate = useNavigate()
  const [title, setTitle] = useState('A quiet place')
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const saveCreation = () => {
    const creations = readStorage<CreationRecord>(CREATION_STORAGE_KEY)
    creations.unshift({ id: crypto.randomUUID(), title: title.trim() || 'Untitled moment', mood, note: note.trim(), createdAt: new Date().toISOString() })
    writeStorage(CREATION_STORAGE_KEY, creations)
    setSaved(true)
  }
  return <div className="page page--inner"><PageHeader eyebrow={t('createEyebrow')} title={t('leaveFeeling')} description={t('createCopy')} /><div className="creation-layout"><section className="creation-preview"><p className="eyebrow">{t('livePreview')}</p><div className="creation-cigarette"><span className="creation-cigarette__filter" /><span className="creation-cigarette__paper" /><span className="creation-cigarette__ember" /></div><div className="creation-preview__caption"><span>{t('tonight')}</span><strong>{mood} / 05</strong></div></section><section className="creation-form"><label>{t('nameMoment')}<input type="text" value={title} onChange={(event) => setTitle(event.target.value)} /></label><div><span className="form-label">{t('carrying')}</span><div className="mood-options">{['Quiet', 'Tired', 'Focused', 'Hopeful', 'Restless'].map((item) => <button type="button" className={mood === item ? 'is-selected' : ''} key={item} onClick={() => setMood(item)}>{item}</button>)}</div></div><label>{t('note')} <span className="optional">{t('optional')}</span><textarea placeholder={t('notePlaceholder')} rows={4} value={note} onChange={(event) => setNote(event.target.value)} /></label><div className="creation-actions"><button className="button button--dark" type="button" onClick={saveCreation}>{saved ? t('saved') : t('saveMoment')} <ArrowUpRight size={16} /></button>{saved && <button className="text-link" type="button" onClick={() => navigate('/history')}>{t('openHistory')} <ChevronRight size={15} /></button>}</div></section></div></div>
}

function HistoryPage() {
  const { t } = useLocale()
  const sessions = readStorage<SessionRecord>(SESSION_STORAGE_KEY).map((record) => ({ ...record, type: 'Ritual', date: record.completedAt }))
  const creations = readStorage<CreationRecord>(CREATION_STORAGE_KEY).map((record) => ({ ...record, type: 'Creation', date: record.createdAt }))
  const records = [...sessions, ...creations].sort((left, right) => right.date.localeCompare(left.date))
  const fallback = [{ title: 'Late train', mood: 'Focused', type: 'Ritual', date: 'Yesterday · 11:42 PM' }, { title: 'After the rain', mood: 'Quiet', type: 'Ritual', date: 'Sep 18 · 08:16 PM' }, { title: 'First light', mood: 'Hopeful', type: 'Ritual', date: 'Sep 16 · 06:04 AM' }]
  const visibleRecords = records.length ? records : fallback
  return <div className="page page--inner"><PageHeader eyebrow={t('historyEyebrow')} title={t('thingsKept')} description={t('historyCopy')} /><div className="history-list">{visibleRecords.map((record, index) => <Link className="history-item" to="#" key={`${record.title}-${index}`}><div className={`history-item__number history-item__number--${index + 1}`}>0{index + 1}</div><div className="history-item__main"><h2>{record.title}</h2><span>{record.type === 'Ritual' ? t('ritual') : t('create')} · {record.mood} {t('mood')}</span></div><time>{formatDate(record.date)}</time><ChevronRight size={18} /></Link>)}</div></div>
}
function SettingsPage() {
  const { locale, setLocale, t } = useLocale()
  const [cleared, setCleared] = useState(false)
  const clearLocalData = () => {
    if (!window.confirm('Clear all local Smoke Air data?')) return
    localStorage.removeItem(SESSION_STORAGE_KEY)
    localStorage.removeItem(CREATION_STORAGE_KEY)
    setCleared(true)
  }
  return <div className="page page--inner"><PageHeader eyebrow={t('preferences')} title={t('makeYours')} description={t('preferencesCopy')} /><div className="settings-list"><div className="setting-row"><div><strong>{t('interfaceLanguage')}</strong><span>{locale === 'en' ? t('english') : t('chinese')}</span></div><button className="select-button" type="button" onClick={() => setLocale(locale === 'en' ? 'zh-CN' : 'en')}>{locale === 'en' ? t('english') : t('chinese')} <ChevronRight size={15} /></button></div><div className="setting-row"><div><strong>{t('reducedMotion')}</strong><span>{t('gentleEffects')}</span></div><button className="toggle" type="button" aria-label={t('reducedMotion')}><span /></button></div><div className="setting-row"><div><strong>{t('localData')}</strong><span>{cleared ? 'Local data cleared' : t('dataCopy')}</span></div><button className="text-link" type="button" onClick={clearLocalData}>{cleared ? 'Cleared' : t('manage')} <ChevronRight size={15} /></button></div></div></div>
}
function AboutPage() {
  return <div className="page page--inner"><PageHeader eyebrow="About Smoke Air" title="A fictional place to pause." description="Smoke Air is a browser-based digital ritual for atmosphere, reflection, and private mood journaling." /><div className="content-note"><h2>What this is</h2><p>A quiet interactive simulator where you can explore visual rituals, create a fictional keepsake, and attach a feeling to a moment.</p><h2>What this is not</h2><p>Smoke Air is not real tobacco guidance, a nicotine product, a health treatment, or a substitute for professional advice.</p></div></div>
}
function LearnPage() {
  return <div className="page page--inner"><PageHeader eyebrow="Learn" title="Digital rituals, explained." description="Short, plain-language notes about virtual simulation and mood journaling." /><div className="learn-grid"><article><span className="eyebrow">01 / Guide</span><h2>What is a virtual smoking simulator?</h2><p>A digital scene that uses motion, light, and sound cues to create a reflective pause without describing or teaching real-world tobacco use.</p><Link className="text-link" to="/about">Read the boundaries <ArrowUpRight size={15} /></Link></article><article><span className="eyebrow">02 / Practice</span><h2>Why attach a mood to a moment?</h2><p>Naming a feeling can turn a fleeting experience into a private journal entry that is easier to revisit later.</p><Link className="text-link" to="/create">Create a private moment <ArrowUpRight size={15} /></Link></article></div></div>
}
function InsightsPage() {
  const sessions = readStorage<SessionRecord>(SESSION_STORAGE_KEY)
  const creations = readStorage<CreationRecord>(CREATION_STORAGE_KEY)
  const total = sessions.length + creations.length
  const moodCounts = [...sessions.map((item) => item.mood), ...creations.map((item) => item.mood)].reduce<Record<string, number>>((counts, mood) => ({ ...counts, [mood]: (counts[mood] ?? 0) + 1 }), {})
  const topMood = Object.entries(moodCounts).sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'Quiet'
  return <div className="page page--inner"><PageHeader eyebrow="Your insights" title="Notice the pattern." description="A gentle read of the moments you have chosen to keep on this device." /><div className="insight-grid"><div className="insight-card insight-card--large"><span className="eyebrow">Saved moments</span><strong>{total.toString().padStart(2, '0')}</strong><p>{total ? 'Your private archive is beginning to take shape.' : 'Your first saved moment will appear here.'}</p><div className="insight-bars"><i style={{ height: `${Math.max(18, Math.min(100, total * 18))}%` }} /><i style={{ height: `${Math.max(28, Math.min(100, total * 12))}%` }} /><i style={{ height: `${Math.max(14, Math.min(100, total * 24))}%` }} /><i style={{ height: `${Math.max(38, Math.min(100, total * 9))}%` }} /></div></div><div className="insight-card"><span className="eyebrow">Most present mood</span><h2>{topMood}</h2><p>{moodCounts[topMood] ?? 0} recorded {moodCounts[topMood] === 1 ? 'time' : 'times'}</p><div className="mood-orbit"><span /><span /><span /></div></div><div className="insight-card"><span className="eyebrow">A small reflection</span><h2>{total ? 'You came back.' : 'Start gently.'}</h2><p>{total ? 'There is value in giving a moment a name.' : 'Create or simulate a moment to reveal your first signal.'}</p><Link className="text-link" to={total ? '/history' : '/create'}>{total ? 'Open history' : 'Make a moment'} <ArrowUpRight size={15} /></Link></div></div></div>
}
function App() {
  const [locale, setLocaleState] = useState<Locale>(() => (localStorage.getItem('smoke-air:v1:locale') as Locale) || 'en')
  const setLocale = (nextLocale: Locale) => { setLocaleState(nextLocale); localStorage.setItem('smoke-air:v1:locale', nextLocale) }
  const t = (key: CopyKey) => copy[locale][key]
  const element = useRoutes(routes)
  return <LocaleContext.Provider value={{ locale, setLocale, t }}><Shell>{element}</Shell></LocaleContext.Provider>
}

export const routes: RouteObject[] = [
  { path: '/', element: <Dashboard /> },
  { path: '/simulate', element: <Simulate /> },
  { path: '/create', element: <Create /> },
  { path: '/history', element: <HistoryPage /> },
  { path: '/insights', element: <InsightsPage /> },
  { path: '/settings', element: <SettingsPage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/learn', element: <LearnPage /> },
  { path: '*', element: <Dashboard /> },
]
export default App
