/**
 * Public provider definitions and persistence helpers for routing configuration.
 */
export type ProviderCategory = 'ramp' | 'swap'

export interface ProviderDef {
  id: string
  name: string
  category: ProviderCategory
  info?: string
}

export const PROVIDERS: ProviderDef[] = [
  { id: 'monerium', name: 'Monerium', category: 'ramp', info: 'Direct + Multi-Party; SEPA CT / SCT Inst' },
  { id: 'pdax', name: 'PDAX', category: 'ramp', info: 'Multi-Party; InstaPay / PESONet' },
  { id: 'coinsph', name: 'Coins.ph', category: 'ramp', info: 'Direct + Multi-Party; InstaPay / PESONet / Wallet' },
  { id: 'brla', name: 'BRLA', category: 'ramp', info: 'PIX' },
  { id: 'straitsx', name: 'StraitsX', category: 'ramp', info: 'Multi-Party; FAST / PayNow / Virtual Accounts' },
  { id: 'noah', name: 'Noah', category: 'ramp', info: 'Multi-Party; SEPA / ACH / Fedwire / RTP / PIX / InstaPay / UPI' },
  { id: 'revolut', name: 'Revolut Ramp', category: 'ramp', info: 'Onramp only' },

  { id: 'lifi', name: 'LI.FI', category: 'swap' },
  { id: 'cowswap', name: 'CowSwap', category: 'swap' },
  { id: '1inch', name: '1inch', category: 'swap' },
]

export const ROUTING_STORAGE_KEY = 'uramp.routing.providers'

export type ProviderToggleState = Record<string, boolean>

/**
 * Read persisted provider toggle state or return an all-enabled default.
 */
export function getSavedProviderToggles(): ProviderToggleState {
  try {
    const raw = localStorage.getItem(ROUTING_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  const init: ProviderToggleState = {}
  for (const p of PROVIDERS) init[p.id] = true
  return init
}

