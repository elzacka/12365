import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// spa-github-pages: 404.html sender oss til `?/<sti>` — gjenopprett den ekte URL-en før React monterer.
const search = window.location.search
if (search.startsWith('?/')) {
  const decoded = search.slice(1).split('&').map(p => p.replace(/~and~/g, '&')).join('?')
  const pathname = window.location.pathname.replace(/\/$/, '')
  window.history.replaceState(null, '', pathname + decoded + window.location.hash)
}

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
