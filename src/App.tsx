import { lazy, Suspense, useLayoutEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { Header } from './components/Header'
import { InstallBanner } from './components/InstallBanner'
import { ArticleBreadcrumb } from './components/ArticleBreadcrumb'
import { LockModal } from './components/LockModal'
import { ScrollToTop } from './components/ScrollToTop'
import { Home } from './pages/Home'
import { Appene } from './pages/Appene'
import { MarkdownPage } from './pages/MarkdownPage'
import omContent from '../OM-APPEN.md?raw'
import personvernContent from '../PERSONVERN.md?raw'
import { GjorSann } from './pages/GjorSann'
import { ArticlePage } from './pages/ArticlePage'
import { SeOgHor } from './pages/SeOgHor'
import { AltIE5OgE7 } from './pages/AltIE5OgE7'
import { Jukselapp } from './pages/Jukselapp'
import { Hurtigtaster } from './pages/Hurtigtaster'
import { KiVurdering } from './pages/KiVurdering'

// Lazy-loaded: pulls in media-chrome, which shouldn't ship in the main bundle for routes that never play video.
const VideoPage = lazy(() => import('./pages/VideoPage').then(m => ({ default: m.VideoPage })))

// Legacy paths of renamed views. The redirect keeps the rest of the path, ?o=<id>
// and the hash, so shared links, bookmarks and the browser's offline index still open.
const LEGACY_PATHS: [string, string][] = [
  ['/om-appene', '/appene'],
  ['/slik-gjor-du', '/gjor-sann'],
  ['/opplaering', '/se-og-hor'],
  ['/om-appen', '/om'],
  ['/lisenser', '/alt-i-e5-og-e7'],
  ['/alt-i-e5', '/alt-i-e5-og-e7'],
  ['/oppslagsverk', '/jukselapp'],
  ['/ordbok', '/jukselapp'],
]

function RedirectKeepingRest({ to }: { to: string }) {
  const { search, hash } = useLocation()
  const rest = useParams()['*']
  return <Navigate to={{ pathname: rest ? `${to}/${rest}` : to, search, hash }} replace />
}

function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
      Laster …
    </div>
  )
}

function getHeaderProps(pathname: string) {
  // The back arrow is shown only when it points somewhere other than home –
  // otherwise it's redundant with the home button.
  if (pathname === '/') return { showMenu: true }
  if (pathname === '/appene') return { title: 'Appene', showHome: true }
  if (pathname === '/gjor-sann') return { title: 'Gjør sånn', showHome: true }
  if (pathname.startsWith('/gjor-sann/')) return { showHome: true, breadcrumb: <ArticleBreadcrumb kategoriId={pathname.split('/')[2]} /> }
  if (pathname === '/se-og-hor') return { title: 'Se og hør', showHome: true }
  if (pathname.startsWith('/se-og-hor/videoer/')) return { showHome: true, showBack: true, backTo: '/se-og-hor' }
  if (pathname === '/om') return { title: 'Om', showHome: true }
  if (pathname === '/personvern') return { title: 'Personvern', showHome: true }
  if (pathname === '/alt-i-e5-og-e7') return { title: 'Alt i E5 og E7', showHome: true }
  if (pathname === '/jukselapp') return { title: 'Jukselapp', showHome: true }
  if (pathname === '/hurtigtaster') return { title: 'Hurtigtaster', showHome: true }
  if (pathname === '/ki-vurdering') return { title: 'KI-vurdering', tagline: 'Fire risikokategorier', beta: true, showHome: true }
  return { showHome: true }
}

function AppRoutes() {
  const { pathname } = useLocation()
  const [lockOpen, setLockOpen] = useState(false)

  // Layout effect, not passive: the new page paints at the top, not at the old scroll position first.
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  const headerProps = getHeaderProps(pathname)

  return (
    <div className="min-h-svh flex flex-col">
      {pathname === '/' && <InstallBanner />}
      <Header {...headerProps} onLockClick={() => setLockOpen(true)} />
      {/* No route cross-fade: the browser drops taps on the page while a view transition runs. */}
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/appene" element={<Appene />} />
          <Route path="/gjor-sann" element={<GjorSann />} />
          <Route path="/gjor-sann/:kategoriId/:artikkelId" element={<ArticlePage />} />
          <Route path="/se-og-hor" element={<SeOgHor />} />
          <Route path="/se-og-hor/videoer/:videoId" element={<VideoPage />} />
          <Route path="/om" element={<MarkdownPage source={omContent} />} />
          <Route path="/personvern" element={<MarkdownPage source={personvernContent} />} />
          <Route path="/alt-i-e5-og-e7" element={<AltIE5OgE7 />} />
          <Route path="/jukselapp" element={<Jukselapp />} />
          <Route path="/hurtigtaster" element={<Hurtigtaster />} />
          <Route path="/ki-vurdering" element={<KiVurdering />} />
          {LEGACY_PATHS.map(([from, to]) => (
            <Route key={from} path={`${from}/*`} element={<RedirectKeepingRest to={to} />} />
          ))}
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
      <ScrollToTop />
      {lockOpen && <LockModal onClose={() => setLockOpen(false)} />}
    </div>
  )
}

// React Router does not want a trailing slash on basename – Vite gives `/12365/` in prod, `/` in dev.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={basename}>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
