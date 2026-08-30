import { useEffect } from 'react'
import { useSeenVersions } from '../lib/SeenVersionsContext'
import { isStandalone } from './useInstallPrompt'

// Ingen tillatelse kreves på Chrome/Edge (desktop og Android) - badge-tallet
// er kun synlig for installerte apper, så vi lar den stå av i vanlig fane.
// iOS Safari støtter API-et, men viser aldri badgen uten at brukeren har gitt
// varslingstillatelse - noe appen ikke ber om, så der forblir den et no-op.
export function useAppBadge() {
  const { ready, newContentCount } = useSeenVersions()

  useEffect(() => {
    if (!ready || !isStandalone()) return
    if (!('setAppBadge' in navigator)) return

    if (newContentCount > 0) {
      void navigator.setAppBadge(newContentCount).catch(() => {})
    } else {
      void navigator.clearAppBadge().catch(() => {})
    }
  }, [ready, newContentCount])
}
