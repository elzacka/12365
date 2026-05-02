import { Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { InstallBanner } from './components/InstallBanner'
import { UpdateToast } from './components/UpdateToast'
import { Home } from './pages/Home'
import { OmAppene } from './pages/OmAppene'
import { SlikGjorDu } from './pages/SlikGjorDu'
import { Artikkel } from './pages/Artikkel'

function Laster() {
  return (
    <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
      Laster …
    </div>
  )
}

function getHeaderProps(pathname: string) {
  if (pathname === '/') return { visHjem: false, visTilbake: false }
  if (pathname === '/om-appene') return { tittel: 'Om appene', visHjem: true, visTilbake: true, tilbakeTil: '/' }
  if (pathname === '/slik-gjor-du') return { tittel: 'Slik gjør du', visHjem: true, visTilbake: true, tilbakeTil: '/' }
  if (pathname.startsWith('/slik-gjor-du/')) return { visHjem: true, visTilbake: true, tilbakeTil: '/slik-gjor-du' }
  return { visHjem: true, visTilbake: true }
}

function AppRoutes() {
  const { pathname } = useLocation()

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
