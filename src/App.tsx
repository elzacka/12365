import { Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { SeenVersionsProvider } from './lib/SeenVersionsContext'
import { Header } from './components/Header'
import { InstallBanner } from './components/InstallBanner'
import { LockModal } from './components/LockModal'
import { UpdateToast } from './components/UpdateToast'
import { Home } from './pages/Home'
import { AboutApps } from './pages/AboutApps'
import { AboutApp } from './pages/AboutApp'
import { Privacy } from './pages/Privacy'
import { HowTo } from './pages/HowTo'
import { ArticlePage } from './pages/ArticlePage'
import { Opplaering } from './pages/Opplaering'
import { VideoPage } from './pages/VideoPage'
import { Licenses } from './pages/Licenses'

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
  // showAbout shows on every surface except Om appen itself and Personvern
  // (Personvern is reached from Om appen, so the info icon would loop).
  if (pathname === '/') return { showHome: false, showBack: false, showLock: true, showAbout: true }
  if (pathname === '/om-appene') return { title: 'Om M365-appene', showHome: true, showBack: false, showAbout: true }
  if (pathname === '/slik-gjor-du') return { title: 'Slik gjør du', showHome: true, showBack: false, showAbout: true }
  if (pathname.startsWith('/slik-gjor-du/')) return { showHome: true, showBack: true, backTo: '/slik-gjor-du', showAbout: true }
  if (pathname === '/opplaering') return { title: 'Opplæring', showHome: true, showBack: false, showAbout: true }
  if (pathname.startsWith('/opplaering/videoer/')) return { showHome: true, showBack: true, backTo: '/opplaering', showAbout: true }
  if (pathname === '/om-appen') return { title: 'Om appen', showHome: true, showBack: false }
  if (pathname === '/personvern') return { title: 'Personvern', showHome: true, showBack: true, backTo: '/om-appen' }
  if (pathname === '/lisenser') return { title: 'Hva følger med i E5-lisensen?', showHome: true, showBack: false, showAbout: true }
  return { showHome: true, showBack: false, showAbout: true }
}

function AppRoutes() {
  const { pathname } = useLocation()
  const [lockOpen, setLockOpen] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  const headerProps = getHeaderProps(pathname)

  return (
    <div className="min-h-svh flex flex-col">
      <InstallBanner />
      <Header {...headerProps} onLockClick={() => setLockOpen(true)} />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/om-appene" element={<AboutApps />} />
          <Route path="/slik-gjor-du" element={<HowTo />} />
          <Route path="/slik-gjor-du/:kategoriId/:artikkelId" element={<ArticlePage />} />
          <Route path="/opplaering" element={<Opplaering />} />
          <Route path="/opplaering/videoer/:videoId" element={<VideoPage />} />
          <Route path="/om-appen" element={<AboutApp />} />
          <Route path="/personvern" element={<Privacy />} />
          <Route path="/lisenser" element={<Licenses />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
      {lockOpen && <LockModal onClose={() => setLockOpen(false)} />}
      <UpdateToast />
    </div>
  )
}

// React Router does not want a trailing slash on basename – Vite gives `/12365/` in prod, `/` in dev.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

export default function App() {
  return (
    <AuthProvider>
      <SeenVersionsProvider>
        <BrowserRouter basename={basename}>
          <AppRoutes />
        </BrowserRouter>
      </SeenVersionsProvider>
    </AuthProvider>
  )
}
