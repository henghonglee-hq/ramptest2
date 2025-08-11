import React from 'react'
import { CurrencyIcon } from '@/ui/components/Icons'
import type { AnyCurrency, CurrencySelection, Chain } from '@/types'
import { FIAT_CURRENCIES, CRYPTO_CURRENCIES, SUPPORTED_TOKEN_CHAINS, shortChainCode } from '@/types'

/**
 * Currency selection dropdown that supports both fiat and crypto (with optional chain badge for tokens).
 * Public component kept at top; private helpers are defined below.
 */
interface CurrencySelectProps {
  value: AnyCurrency | CurrencySelection
  onChange: (value: AnyCurrency | CurrencySelection) => void
  placeholder?: string
}

export function CurrencySelect({ value, onChange, placeholder = 'Search currency' }: CurrencySelectProps): JSX.Element {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  type OptionEntry = { key: string; label: string; selection: CurrencySelection; iconCode: AnyCurrency; badge?: Chain; searchable: string }

  const options = React.useMemo<OptionEntry[]>(() => {
    const fiatOptions: OptionEntry[] = FIAT_CURRENCIES.map(code => ({
      key: code,
      label: code,
      selection: { kind: 'fiat', code } as CurrencySelection,
      iconCode: code,
      badge: undefined,
      searchable: code,
    }))

    const cryptoFlat: OptionEntry[] = []
    for (const code of CRYPTO_CURRENCIES) {
      const chains = SUPPORTED_TOKEN_CHAINS[code]
      if (!chains) {
        cryptoFlat.push({ key: code, label: code, selection: { kind: 'crypto', code }, iconCode: code, searchable: code })
      } else {
        for (const chain of chains) {
          const label = `${code} on ${shortChainCode(chain)}`
          cryptoFlat.push({ key: `${code}-${chain}`, label, selection: { kind: 'crypto', code, chain }, iconCode: code, badge: chain, searchable: `${code} ${chain}` })
        }
      }
    }

    const all = [...fiatOptions, ...cryptoFlat]
    if (!query.trim()) return all
    const q = query.trim().toLowerCase()
    return all.filter(o => o.searchable.toLowerCase().includes(q))
  }, [query])

  React.useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0)
  }, [open])

  return (
    <div style={{ position: 'relative' }} onBlur={(e) => {
      // Close dropdown when focus leaves the container
      if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false)
    }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', width: '100%' }}
      >
        <CurrencyIcon code={_displayIconCode(value)} chain={_displayIconChain(value)} />
        <span style={{ fontWeight: 600 }}>{_displayLabel(value)}</span>
      </button>

      {open && (
        <div style={{ position: 'absolute', zIndex: 10, top: 'calc(100% + 6px)', left: 0, right: 0, background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, boxShadow: '0 6px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ padding: 8 }}>
            <input
              ref={inputRef}
              placeholder={placeholder}
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 8 }}
            />
          </div>
          <div style={{ maxHeight: 240, overflow: 'auto' }}>
            {options.map(o => (
              <button
                key={o.key}
                type="button"
                onClick={() => { onChange(o.selection); setOpen(false); setQuery('') }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, width: '100%', background: 'white', border: 'none', borderTop: '1px solid #f1f5f9', cursor: 'pointer' }}
              >
                <CurrencyIcon code={o.iconCode} chain={o.badge} />
                <div style={{ fontWeight: 600 }}>{o.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function _displayLabel(value: AnyCurrency | CurrencySelection): string {
  if (typeof value === 'string') return value
  if (value.kind === 'fiat') return value.code
  if (value.chain) return `${value.code} on ${shortChainCode(value.chain)}`
  return value.code
}

function _displayIconCode(value: AnyCurrency | CurrencySelection): AnyCurrency {
  if (typeof value === 'string') return value
  return value.code
}

function _displayIconChain(value: AnyCurrency | CurrencySelection): Chain | undefined {
  if (typeof value === 'string') return undefined
  return value.chain
}

