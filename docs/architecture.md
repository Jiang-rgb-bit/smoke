# Smoke Air Architecture

> A global, multilingual virtual smoking simulator focused on atmosphere, personal ritual, and mood journaling. The experience is fictional and does not provide instructions for making or using real tobacco products.

## 1. Product Direction

Smoke Air is a browser-first experience with four connected loops:

1. **Explore**: see today's status and recent personal moments.
2. **Simulate**: run a short, visual virtual smoking session.
3. **Create**: design a fictional custom cigarette and attach a mood note.
4. **Remember**: review saved sessions, creations, and mood patterns.

The default locale is English. Chinese is the first additional locale. The interface must remain usable when translated strings become longer.

## 2. Scope

### Version 1

- Responsive web app, optimized for mobile and desktop.
- English default locale with English and Chinese translations.
- Local-only persistence using `localStorage`.
- Dashboard, simulator, custom creation, history, insights, and settings.
- Fictional cigarette styles, smoke, ember, and atmosphere effects.
- Mood selection, intensity, and private note attached to a custom creation or session.
- Reduced-motion support and keyboard-accessible controls.
- Installable PWA shell.

### Later

- Account-based sync.
- Cloud backup and export.
- More locales.
- Shareable result cards with private content opt-in.
- Optional social or community features, subject to privacy and moderation review.

### Out of scope for Version 1

- Real tobacco recipes, rolling instructions, or consumption guidance.
- Health diagnosis or medical claims.
- User-to-user messaging.
- Payments, subscriptions, or advertising.

## 3. Technology Decisions

- **Build**: Vite
- **UI**: React + TypeScript
- **Styling**: Tailwind CSS with project CSS variables for visual tokens
- **Icons**: Lucide React
- **Motion**: CSS keyframes for ambient effects; Motion for stateful transitions only where needed
- **Routing**: React Router
- **State**: Zustand for app/session state
- **Charts**: Recharts for history trends
- **Localization**: i18next + react-i18next
- **Persistence**: a typed storage adapter backed by `localStorage`
- **PWA**: `vite-plugin-pwa`
- **Testing**: Vitest + React Testing Library; Playwright for end-to-end smoke flows
- **Deployment**: Vercel or Netlify

The first implementation should not require a backend. A storage adapter keeps the later Supabase integration from leaking into UI components.

## 4. Route Map

| Route | Screen | Responsibility |
|---|---|---|
| `/` | Home | Today's overview, quick start, recent creation, lightweight stats |
| `/simulate` | Simulator setup | Choose a fictional style and duration |
| `/simulate/:sessionId` | Active simulator | Run the virtual session and display progress/atmosphere |
| `/simulate/:sessionId/result` | Session result | Review metrics, mood, note, and save actions |
| `/create` | Create Your Own | Build a fictional cigarette and attach a mood |
| `/create/:creationId` | Creation detail | Reopen, edit, or start a simulation from a saved creation |
| `/history` | History | Browse and filter past sessions and creations |
| `/insights` | Insights | Show trends and mood-linked summaries |
| `/settings` | Settings | Locale, units, motion, privacy, and local data controls |
| `/about` | About | Product boundaries, fictional-use note, privacy explanation |

### Navigation

Mobile bottom navigation:

- Home
- Simulate
- Create
- History

Settings and About live behind the account/menu button. Insights is reachable from Home and History so the primary navigation stays compact.

## 5. Application Layers

```text
src/
  app/                 App shell, router, providers, error boundary
  components/          Shared UI primitives and accessible controls
  features/
    home/              Dashboard view and widgets
    simulator/         Setup, active session, result, atmosphere effects
    creation/          Custom cigarette builder and creation detail
    history/           Records list, filters, empty states
    insights/          Aggregations and charts
    settings/          Preferences and data controls
  stores/              Zustand stores and selectors
  domain/              Pure types, constants, and business rules
  services/            Storage, analytics boundary, future sync boundary
  i18n/                Locale setup and translation resources
  styles/              Tokens, global styles, animation keyframes
  test/                Test setup and fixtures
public/
  images/              Brand and visual assets
  icons/               Favicon and PWA icons
docs/
  architecture.md
```

### Ownership Rules

- Route components compose features; they do not own persistence logic.
- Feature components may call typed store actions, but should not access `localStorage` directly.
- Domain calculations stay pure and are testable without React.
- Visual effects receive state as props and do not calculate business metrics.
- Translation keys are used in UI; user-facing copy is not hard-coded in components.

## 6. Core Domain Model

```ts
export type Locale = 'en' | 'zh-CN'

export type MoodId =
  | 'calm'
  | 'tired'
  | 'focused'
  | 'lonely'
  | 'happy'
  | 'angry'
  | 'restless'

export type VirtualStyleId = 'classic' | 'menthol' | 'cigar' | 'herbal'

export interface MoodEntry {
  id: MoodId
  intensity: number // 1..5
  note: string
}

export interface CustomCreation {
  id: string
  name: string
  styleId: VirtualStyleId
  paperColor: string
  filterColor: string
  tobaccoColor: string
  mood: MoodEntry
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface SimulationSession {
  id: string
  creationId?: string
  styleId: VirtualStyleId
  durationSeconds: number
  elapsedSeconds: number
  completed: boolean
  mood?: MoodEntry
  startedAt: string
  completedAt?: string
}

export interface UserPreferences {
  locale: Locale
  reducedMotion: boolean
  soundEnabled: boolean
  preferredDurationSeconds: number
}
```

### Data Boundaries

`domain/` owns the types and pure rules. `services/storage` serializes these records. Zustand owns the in-memory session and preference state. UI reads selectors and dispatches actions.

## 7. Main User Flows

### 7.1 Quick Start

```text
Home -> Simulate setup -> Active simulator -> Result -> History
```

### 7.2 Create a Mood-Linked Fictional Cigarette

```text
Home/Create -> Choose visual style -> Add mood + note -> Preview -> Save
  -> Optional active simulation -> Result -> History
```

The create flow should feel like a personal journal entry, not a real-world tobacco-making tutorial. Avoid material quantities, preparation instructions, or claims about physical effects.

### 7.3 Review a Moment

```text
History -> Session or creation detail -> Read mood note -> Replay or edit
```

## 8. Simulator State Machine

```text
idle
  -> selecting
  -> ready
  -> lighting
  -> active
  -> completed
  -> saved

active -> paused -> active
active -> abandoned
```

The timer and progress value are controlled by React/Zustand state. CSS keyframes only animate the visual layer. This keeps the result data deterministic even when the tab is throttled or animations are disabled.

## 9. Animation System

Animation names are kebab-case and live in `src/styles/animations.css`.

| Keyframe | Used by | Purpose |
|---|---|---|
| `home-enter` | Home | Stagger dashboard content into view |
| `stat-count-up` | Stats | Bring attention to changing values |
| `pack-select` | Style selector | Confirm a selected style |
| `ignite-button` | Ignite action | Provide pressed feedback |
| `flame-light` | Ember/flame | Start the visual session |
| `ember-glow` | Ember | Ambient glow loop |
| `smoke-rise` | Smoke particles | Slow upward drift and fade |
| `breath-cycle` | Simulator stage | Subtle session rhythm |
| `inhale-feedback` | Session feedback | Signal a simulated interaction |
| `result-reveal` | Result | Reveal session summary |
| `history-list-enter` | History | Stagger records into view |
| `chart-draw` | Insights | Draw trend lines |
| `bar-rise` | Insights | Reveal bar chart values |
| `mood-ink` | Creation | Reveal mood text in preview |
| `creation-save` | Creation | Confirm the saved moment |
| `memory-reveal` | Result/detail | Bring the private note into focus |

Every non-essential animation must be disabled or reduced under `prefers-reduced-motion: reduce` and the in-app motion preference.

## 10. Localization

Translation namespace groups:

```text
common.*
nav.*
home.*
simulator.*
creation.*
history.*
insights.*
settings.*
about.*
errors.*
```

Rules:

- English is the fallback language.
- Translation keys, not translated text, are persisted in user preferences.
- User-created names and mood notes are never translated automatically.
- Dates and numbers use `Intl.DateTimeFormat` and `Intl.NumberFormat`.
- Layouts must tolerate at least 35% expansion from the English source string.

## 11. Storage and Privacy

Version 1 stores data locally in the browser:

```text
smoke-air:preferences
smoke-air:creations
smoke-air:sessions
```

The storage service must:

- Validate parsed data before returning it.
- Handle missing, malformed, and unavailable storage gracefully.
- Provide clear delete-all-data and export-data actions.
- Keep private mood notes out of analytics events.

A future sync service can implement the same interface without changing feature components.

## 12. Accessibility and Safety

- All controls have visible focus states and accessible labels.
- Do not communicate that the simulation is healthy, therapeutic, or medically effective.
- Add a concise fictional-experience notice in About and the simulator entry point.
- Keep mood notes private by default.
- Support keyboard navigation, reduced motion, sufficient contrast, and touch targets of at least 44px.
- Ensure smoke and glow effects are decorative and never the only way to understand state.

## 13. Testing Strategy

### Unit tests

- Session state transitions.
- Progress and duration calculations.
- Storage parsing and migrations.
- Locale fallback behavior.
- Mood and creation validation.

### Component tests

- Simulator can start, pause, resume, complete, and save.
- Creation preview updates when style or mood changes.
- Empty history and malformed storage states are usable.
- Settings update locale and reduced-motion preference.

### End-to-end smoke tests

1. Open Home in English.
2. Switch to Chinese and verify navigation labels.
3. Start and complete a simulation.
4. Create a custom fictional cigarette with a mood note.
5. Confirm both records appear in History.
6. Delete local data and confirm the empty state.

## 14. Delivery Phases

### Phase 0: Foundation

- Scaffold Vite + React + TypeScript.
- Add routing, tokens, app shell, i18n, and typed storage adapter.
- Add global reduced-motion handling.

### Phase 1: First usable loop

- Build Home, Simulator, Result, and History.
- Add the first three fictional styles.
- Persist completed sessions locally.

### Phase 2: Personal creation

- Build Create Your Own flow.
- Add mood entry, note, custom preview, and creation detail.
- Link creations to simulations.

### Phase 3: Polish and insight

- Add Insights, charts, PWA setup, empty states, export/delete controls.
- Add Playwright smoke coverage.
- Validate mobile and desktop layouts.

### Phase 4: Backend readiness

- Replace storage implementation with optional sync service.
- Add authentication only after privacy and data ownership decisions are approved.

## 15. Discovery: SEO and GEO

The acquisition strategy has two related layers:

- **SEO**: make public, useful pages crawlable and understandable by traditional search engines.
- **GEO**: make factual, well-structured answers easy for generative search systems and assistants to quote with the correct context.

### Public and private boundary

Indexable pages:

- Home / product overview.
- About and fictional-experience boundary.
- Public glossary and educational articles about digital rituals, mood journaling, and interactive simulation.
- Localized landing pages for supported languages.

Private or non-indexable pages:

- Active simulator sessions.
- User-created cigarettes and mood notes.
- History, insights, settings, and local data controls.

The product must never put private notes, local identifiers, or generated personal records into page metadata, analytics payloads, sitemap URLs, or share previews by default.

### Technical SEO foundation

- Use semantic HTML with one clear `h1` per public page.
- Give every public route a stable canonical URL.
- Add `lang` and `hreflang` links for each published locale.
- Generate `sitemap.xml` from the public route registry only.
- Add `robots.txt` that disallows private app routes and allows public content.
- Render public metadata in the initial HTML so crawlers do not depend on client-side hydration.
- Add Open Graph and Twitter card metadata with restrained, factual copy.
- Use descriptive page titles and meta descriptions, avoiding medical or health promises.
- Optimize image formats, dimensions, alt text, and loading priority.
- Keep Core Web Vitals healthy: avoid blocking font/image downloads and keep the interactive simulator lazy-loaded where possible.

### Structured data

Use JSON-LD only where the content genuinely matches the schema:

- `WebSite` for the product home.
- `WebApplication` for the browser experience.
- `Article` for editorial pages.
- `BreadcrumbList` for nested public content.
- `FAQPage` only for visible, genuinely answered FAQs.

Do not mark private user creations, mood notes, or fictional simulation results as public reviews, medical content, or user-generated testimonials.

### Content architecture for discovery

Create a small public content system rather than filling the product UI with keyword text:

```text
/                product overview and simulator entry
/about           boundaries, privacy, and fictional-use explanation
/learn           editorial index
/learn/virtual-smoking-simulator
/learn/mood-journaling
/learn/digital-rituals
/[locale]/...    localized equivalents when the translation is complete
```

Each article should answer one clear user question, include a short direct answer near the top, link to the simulator where relevant, and cite or link to credible sources when making factual claims. Content should emphasize digital experience and reflection, not encourage tobacco use.

### GEO writing rules

- Put a concise definition and answer before longer context.
- Use descriptive headings, short paragraphs, lists, and explicit terminology.
- Add a small “What this is / What this is not” block to relevant pages.
- State that Smoke Air is a fictional virtual simulator and does not provide real tobacco instructions or health advice.
- Keep product facts consistent across metadata, About, FAQ, and articles.
- Include author, update date, and source links on editorial pages.
- Prefer original product documentation and transparent methodology over generic keyword pages.
- Do not generate large volumes of near-duplicate localized pages.

### International reach

The first locale is English, with Simplified Chinese next. Add a locale to the sitemap only after its navigation, metadata, core landing copy, and legal/privacy copy are reviewed.

Use path-based locale URLs when public content expands, for example `/en/learn/...` and `/zh-CN/learn/...`. Until then, the English root can remain canonical and the app locale can be selected in settings. Never use a cookie-only locale switch for crawlable public pages.

### Measurement

Track acquisition without storing mood content:

- Search impressions, clicks, indexed pages, and query groups.
- Organic landing-page engagement and simulator start rate.
- Referral traffic from AI answer engines where referrer data is available.
- Branded search growth and assisted conversions.
- Core Web Vitals, crawl errors, and localization coverage.

Set up Search Console, Bing Webmaster Tools, privacy-conscious analytics, and a monthly content review. GEO visibility is difficult to measure precisely, so treat citations and qualified visits as directional signals rather than a guaranteed ranking metric.

### Discovery delivery order

1. Make the public Home, About, and one Learn page indexable with complete metadata.
2. Add sitemap, robots rules, canonical URLs, JSON-LD, and social previews.
3. Publish the English content set and validate it with structured-data and Lighthouse checks.
4. Add reviewed Chinese equivalents and `hreflang` only when complete.
5. Expand the content cluster based on real search questions and qualified traffic.

## 16. Open Decisions

- Final product name and logo direction.
- Whether the simulator should have sound by default.
- Whether session duration is fixed or user-selectable.
- Which mood vocabulary and translations are culturally appropriate.
- Whether sharing should be included in Version 1.1.
- Whether account sync is needed before launch.
