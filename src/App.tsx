import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { Home } from './pages/Home'
import { OmAppene } from './pages/OmAppene'
import { SlikGjorDu } from './pages/SlikGjorDu'
import { Artikkel } from './pages/Artikkel'

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
      <Header {...getHeaderProps(pathname)} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/om-appene" element={<OmAppene />} />
        <Route path="/slik-gjor-du" element={<SlikGjorDu />} />
        <Route path="/slik-gjor-du/:kategoriId/:artikkelId" element={<Artikkel />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
