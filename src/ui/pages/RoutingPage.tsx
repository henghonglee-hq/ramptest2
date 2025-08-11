import React from 'react'
import { Switch } from '@/ui/components/Switch'
import { InfoTooltip } from '@/ui/components/InfoTooltip'
import type { ProviderDef } from '@/lib/providers'
import { PROVIDERS, ROUTING_STORAGE_KEY } from '@/lib/providers'

type ProviderState = Record<string, boolean>

/**
 * Provider routing configuration page. Allows toggling which ramp/swap providers are active.
 * Choices are persisted in `localStorage` under `ROUTING_STORAGE_KEY`.
 */
export function RoutingPage(): JSX.Element {
  const [state, setState] = React.useState<ProviderState>(() => {
    try {
      const raw = localStorage.getItem(ROUTING_STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
    // default: all enabled
    const init: ProviderState = {}
    for (const p of PROVIDERS) init[p.id] = true
    return init
  })

  React.useEffect(() => {
    try { localStorage.setItem(ROUTING_STORAGE_KEY, JSON.stringify(state)) } catch {}
  }, [state])

  function toggle(id: string): void {
    setState(s => ({ ...s, [id]: !s[id] }))
  }

  function setOn(id: string): void {
    setState(s => ({ ...s, [id]: true }))
  }

  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})
  function toggleExpanded(id: string): void {
    setExpanded(e => ({ ...e, [id]: !e[id] }))
  }

  const sections: Array<{ title: string; items: ProviderDef[] }> = [
    { title: 'Ramp', items: PROVIDERS.filter(p => p.category === 'ramp') },
    { title: 'Swap', items: PROVIDERS.filter(p => p.category === 'swap') },
  ]

  return (
    <div style={{ background: '#ffffff', color: 'var(--surface-text)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
      {sections.map(section => (
        <div key={section.title} style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ fontWeight: 900, color: '#0f172a' }}>{section.title}</div>
              <div style={{ fontSize: 12, color: '#334155' }}>Toggle providers. Your choices are saved automatically.</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
            {section.items.map(p => (
              <div
                key={p.id}
                style={{
                  padding: '10px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  transition: 'background 120ms ease, border-color 120ms ease',
                }}
              >
                <label style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <div style={{ width: 18, display: 'flex', justifyContent: 'center' }}>
                      {p.category === 'ramp' && !state[p.id] && (
                        <button
                          type="button"
                          aria-label="Toggle provider options"
                          onClick={() => toggleExpanded(p.id)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
                        >
                          {expanded[p.id] ? '▾' : '▸'}
                        </button>
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      {p.info && <div style={{ fontSize: 12, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.info}</div>}
                    </div>
                  </div>
                  <Switch
                    checked={Boolean(state[p.id])}
                    onChange={() => {
                      const isOn = Boolean(state[p.id])
                      if (p.category === 'ramp') {
                        if (!isOn) {
                          // Only OFF-state dropdown actions may enable ramp providers
                          toggleExpanded(p.id)
                          return
                        }
                        // Allow turning OFF directly
                        toggle(p.id)
                        return
                      }
                      // Non-ramp (swap) can toggle freely
                      toggle(p.id)
                    }}
                  />
                </label>
                {p.category === 'ramp' && !state[p.id] && expanded[p.id] && (
                  <div style={{ marginTop: 8, background: '#f9fafb', border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
                    <RampEnableOptions providerId={p.id} providerName={p.name} onEnabled={() => setOn(p.id)} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Supported enable models per provider
const RAMP_ENABLE_MODELS: Record<string, Array<1 | 2 | 3 | 4>> = {
  monerium: [1, 4],
  pdax: [2],
  coinsph: [1, 2],
  revolut: [3],
  noah: [4],
  brla: [3],
  straitsx: [4],
}

function RampEnableOptions({ providerId, providerName, onEnabled }: { providerId: string; providerName: string; onEnabled: () => void }): JSX.Element {
  const models = RAMP_ENABLE_MODELS[providerId] || []
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {models.includes(1) && <DirectModelForm providerId={providerId} onEnabled={onEnabled} />}
      {models.includes(2) && <MultiPartyModel1 providerName={providerName} onEnabled={onEnabled} />}
      {models.includes(3) && <MultiPartyModel2 providerName={providerName} onEnabled={onEnabled} />}
      {models.includes(4) && <MultiPartyModel3 providerName={providerName} onEnabled={onEnabled} />}
    </div>
  )
}

function DirectModelForm({ providerId, onEnabled }: { providerId: string; onEnabled: () => void }): JSX.Element {
  const [apiKey, setApiKey] = React.useState('')
  const [apiSecret, setApiSecret] = React.useState('')
  const [accountId, setAccountId] = React.useState('')
  function save(): void {
    const key = `uramp.credentials.${providerId}`
    try { localStorage.setItem(key, JSON.stringify({ apiKey, apiSecret, accountId })) } catch {}
    onEnabled()
  }
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 10 }}>
      <div style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>Direct Model</span>
        <InfoTooltip text="User links their own account via API credentials (e.g., API key/secret). uRamp orchestrates transfers using their account. Best for power users who already have provider accounts." />
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        <input placeholder="API Key" value={apiKey} onChange={e => setApiKey(e.target.value)} style={inputStyle} />
        <input placeholder="API Secret" value={apiSecret} onChange={e => setApiSecret(e.target.value)} style={inputStyle} />
        <input placeholder="Account ID (optional)" value={accountId} onChange={e => setAccountId(e.target.value)} style={inputStyle} />
        <button className="btn" style={{ alignSelf: 'start' }} onClick={save} type="button">Save & Enable</button>
      </div>
    </div>
  )
}

function MultiPartyModel1({ providerName, onEnabled }: { providerName: string; onEnabled: () => void }): JSX.Element {
  const [show, setShow] = React.useState<null | 'oauth' | 'signup'>(null)
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 10 }}>
      <div style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>Multi-Party Model 1</span>
        <InfoTooltip text="User already has an account at the provider. They authenticate via OAuth to grant uRamp access. Use this when end-users manage their own provider accounts." />
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn" type="button" onClick={() => setShow('oauth')}>Have account → Link</button>
        <button className="btn" type="button" onClick={() => setShow('signup')}>No account → Sign up</button>
      </div>
      {show === 'oauth' && (
        <Modal onClose={() => setShow(null)}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Grant Permissions</div>
          <div className="muted" style={{ marginBottom: 12 }}>Grant permissions for uRamp to use your {providerName} account...</div>
          <button className="btn" type="button" onClick={() => { setShow(null); onEnabled() }}>Grant</button>
        </Modal>
      )}
      {show === 'signup' && (
        <Modal onClose={() => setShow(null)}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Sign up on {providerName}</div>
          <div className="muted" style={{ marginBottom: 12 }}>Embedded signup form (stub)</div>
          <button className="btn" type="button" onClick={() => { setShow(null); onEnabled() }}>Done</button>
        </Modal>
      )}
    </div>
  )
}

function MultiPartyModel2({ providerName, onEnabled }: { providerName: string; onEnabled: () => void }): JSX.Element {
  const [open, setOpen] = React.useState(false)
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 10 }}>
      <div style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>Multi-Party Model 2</span>
        <InfoTooltip text="User does not have an account. They sign up themselves on the provider via an embedded/redirected flow. Biz Account later uses that account to orchestrate payouts/collections." />
      </div>
      <button className="btn" type="button" onClick={() => setOpen(true)}>Sign up on {providerName}</button>
      {open && (
        <Modal onClose={() => setOpen(false)}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Sign up on {providerName}</div>
          <div className="muted" style={{ marginBottom: 12 }}>Embedded signup form (stub)</div>
          <button className="btn" type="button" onClick={() => { setOpen(false); onEnabled() }}>Done</button>
        </Modal>
      )}
    </div>
  )
}

function MultiPartyModel3({ providerName, onEnabled }: { providerName: string; onEnabled: () => void }): JSX.Element {
  const [email, setEmail] = React.useState('')
  function create(): void {
    // Stub: pretend server created the account
    alert(`Account created on ${providerName} for ${email}`)
    onEnabled()
  }
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 10 }}>
      <div style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>Multi-Party Model 3</span>
        <InfoTooltip text="Biz Account provisions a sub-account for the User under the master business account (server-side). No end-user dashboard credentials needed; Master Account / uRamp manages onboarding and payouts." />
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
        <button className="btn" type="button" onClick={create}>Create Account</button>
      </div>
    </div>
  )
}

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }): JSX.Element {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div className="card" style={{ width: 420, maxWidth: '90vw' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8 }

