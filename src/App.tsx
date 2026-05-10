import { Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { InstallBanner } from './components/InstallBanner'
import { UpdateToast } from './components/UpdateToast'
import { Home } from './pages/Home'
import { OmAppene } from './pages/OmAppene'
import { OmAppen } from './pages/OmAppen'
import { Personvern } from './pages/Personvern'
import { SlikGjorDu } from './pages/SlikGjorDu'
import { Artikkel } from './pages/Artikkel'
import { Videoer } from './pages/Videoer'
import { Video } from './pages/Video'
import { Lisenser } from './pages/Lisenser'

function Laster() {
  return (
    <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
      Laster …
    </div>
  )
}

function getHeaderProps(pathname: string) {
  // Tilbake-pilen vises kun når den peker til et annet sted enn hovedsiden —
  // ellers er den redundant med Hjem-knappen.
  if (pathname === '/') return { visHjem: false, visTilbake: false }
  if (pathname === '/om-appene') return { tittel: 'Om M365-appene', visHjem: true, visTilbake: false }
  if (pathname === '/slik-gjor-du') return { tittel: 'Slik gjør du', visHjem: true, visTilbake: false }
  if (pathname.startsWith('/slik-gjor-du/')) return { visHjem: true, visTilbake: true, tilbakeTil: '/slik-gjor-du' }
  if (pathname === '/videoer') return { tittel: 'Videoer', visHjem: true, visTilbake: false }
  if (pathname.startsWith('/videoer/')) return { visHjem: true, visTilbake: true, tilbakeTil: '/videoer' }
  if (pathname === '/om-appen') return { tittel: 'Om appen', visHjem: true, visTilbake: false }
  if (pathname === '/personvern') return { tittel: 'Personvern', visHjem: true, visTilbake: true, tilbakeTil: '/om-appen' }
  if (pathname === '/lisenser') return { tittel: 'Hva følger med i M365 E3 og E5?', visHjem: true, visTilbake: false }
  return { visHjem: true, visTilbake: false }
}

function AppRoutes() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <div className="min-h-svh flex flex-col">
      <InstallBanner />
      <Header {...getHeaderProps(pathname)} />
      <Suspense fallback={<Laster />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/om-appene" element={<OmAppene />} />
          <Route path="/slik-gjor-du" element={<SlikGjorDu />} />
          <Route path="/slik-gjor-du/:kategoriId/:artikkelId" element={<Artikkel />} />
          <Route path="/videoer" element={<Videoer />} />
          <Route path="/videoer/:videoId" element={<Video />} />
          <Route path="/om-appen" element={<OmAppen />} />
          <Route path="/personvern" element={<Personvern />} />
          <Route path="/lisenser" element={<Lisenser />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
      <UpdateToast />
    </div>
  )
}

// React Router vil ikke ha trailing slash på basename — Vite gir `/12365/` i prod, `/` i dev.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <AppRoutes />
    </BrowserRouter>
  )
}
