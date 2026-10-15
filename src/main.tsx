import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { registerAppUpdate } from './lib/registerAppUpdate'
import { registerContentIndex } from './lib/registerContentIndex'

registerAppUpdate()
void registerContentIndex()

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
