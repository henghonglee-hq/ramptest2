import React from 'react'
import { Navigation } from './components/Navigation'
import { ConvertPage } from './pages/ConvertPage'
import { SwapPage } from './pages/SwapPage'
import { ActivityPage } from './pages/ActivityPage'
import { RoutingPage } from './pages/RoutingPage'
import { Logo } from './components/Logo'

interface AppProps {
  isExtensionPopup?: boolean
  theme?: 'light' | 'dark'
}

export function App({ isExtensionPopup = false, theme = 'dark' }: AppProps): JSX.Element {
  const [tab, setTab] = React.useState<'convert' | 'activity' | 'routing'>('convert')

  const containerStyle = isExtensionPopup 
    ? { width: '100%', minWidth: 280, maxWidth: 380, margin: '0 auto', padding: '16px 0 32px' }
    : { width: '30vw', minWidth: 340, margin: '0 auto', padding: '24px 0 80px' }

  const rootStyle = isExtensionPopup
    ? { fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif', color: 'var(--text)' }
    : { fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif', color: 'var(--text)', minHeight: '100vh' }

  return (
    <div
      style={rootStyle}
      className={`uramp-root ${isExtensionPopup ? 'extension-popup' : ''} uramp-theme-${theme}`.trim()}
    >
      <div className="container" style={containerStyle}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isExtensionPopup ? 16 : 24 }}>
          <Logo size={isExtensionPopup ? 28 : 34} withWordmark />
        </header>
        <Navigation value={tab} onChange={setTab} />
        <main style={{ marginTop: isExtensionPopup ? 16 : 24 }}>
          {tab === 'convert' && <div className="card"><ConvertPage /></div>}
          {tab === 'activity' && <div className="card"><ActivityPage /></div>}
          {tab === 'routing' && <div className="card"><RoutingPage /></div>}
        </main>
      </div>
    </div>
  )
}

