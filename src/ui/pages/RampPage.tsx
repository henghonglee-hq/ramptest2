import React from 'react'
import { Field, Input, Select, Button } from '@/ui/components/FormControls'
import { CurrencyIcon } from '@/ui/components/Icons'
import type { CryptoCurrency, FiatCurrency, Chain } from '@/types'
import { getOnRampQuote, getOffRampQuote, submitOnRamp, submitOffRamp } from '@/lib/api'

type Mode = 'buy' | 'sell'

const FIAT: FiatCurrency[] = ['USD', 'EUR', 'GBP', 'SGD', 'AUD']
const CRYPTO: CryptoCurrency[] = ['USDC', 'USDT', 'BTC', 'ETH', 'SOL']
const CHAIN_BY_TOKEN: Partial<Record<CryptoCurrency, Chain>> = {
  USDC: 'Ethereum',
  USDT: 'Ethereum',
}

export function RampPage(): JSX.Element {
  const [mode, setMode] = React.useState<Mode>('buy')

  const [fiatCurrency, setFiatCurrency] = React.useState<FiatCurrency>('USD')
  const [cryptoCurrency, setCryptoCurrency] = React.useState<CryptoCurrency>('USDC')
  const [fiatAmount, setFiatAmount] = React.useState('250')
  const [cryptoAmount, setCryptoAmount] = React.useState('250')
  const [loading, setLoading] = React.useState(false)
  const [quote, setQuote] = React.useState<any | null>(null)
  const [result, setResult] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    const task = mode === 'buy'
      ? getOnRampQuote({ fiatCurrency, fiatAmount, cryptoCurrency })
      : getOffRampQuote({ cryptoCurrency, cryptoAmount, fiatCurrency })
    task
      .then(q => { if (!cancelled) setQuote(q) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [mode, fiatCurrency, cryptoCurrency, fiatAmount, cryptoAmount])

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setResult(null)
    setLoading(true)
    try {
      const r = mode === 'buy'
        ? await submitOnRamp({ fiatCurrency, fiatAmount, cryptoCurrency })
        : await submitOffRamp({ fiatCurrency, cryptoAmount, cryptoCurrency })
      setResult(`Submitted: ${r.id}`)
    } finally {
      setLoading(false)
    }
  }

  const rightAmountField = mode === 'buy' ? (
    <Field label="Amount (fiat)">
      <Input type="number" min="0" step="0.01" value={fiatAmount} onChange={e => setFiatAmount(e.target.value)} />
    </Field>
  ) : (
    <Field label="Amount (crypto)">
      <Input type="number" min="0" step="0.0001" value={cryptoAmount} onChange={e => setCryptoAmount(e.target.value)} />
    </Field>
  )

  const chainOverlay = CHAIN_BY_TOKEN[cryptoCurrency]

  return (
    <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => setMode('buy')} style={_tabStyle(mode === 'buy')}>Buy</button>
        <button type="button" onClick={() => setMode('sell')} style={_tabStyle(mode === 'sell')}>Sell</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {mode === 'buy' ? (
          <Field label="Pay with">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CurrencyIcon code={fiatCurrency} />
              <Select value={fiatCurrency} onChange={e => setFiatCurrency(e.target.value as FiatCurrency)}>
                {FIAT.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
          </Field>
        ) : (
          <Field label="Sell">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CurrencyIcon code={cryptoCurrency} chain={chainOverlay} />
              <Select value={cryptoCurrency} onChange={e => setCryptoCurrency(e.target.value as CryptoCurrency)}>
                {CRYPTO.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
          </Field>
        )}

        {rightAmountField}

        {mode === 'buy' ? (
          <Field label="Receive">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CurrencyIcon code={cryptoCurrency} chain={chainOverlay} />
              <Select value={cryptoCurrency} onChange={e => setCryptoCurrency(e.target.value as CryptoCurrency)}>
                {CRYPTO.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
          </Field>
        ) : (
          <Field label="Receive">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CurrencyIcon code={fiatCurrency} />
              <Select value={fiatCurrency} onChange={e => setFiatCurrency(e.target.value as FiatCurrency)}>
                {FIAT.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
          </Field>
        )}

        <div style={{ alignSelf: 'end' }}>
          <Button type="submit" disabled={loading}>{mode === 'buy' ? 'Buy' : 'Sell'}</Button>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 14, color: '#0f172a' }}>
        {loading && 'Loading quote...'}
        {!loading && quote && (
          <div>
            Quote: {quote.sourceAmount} {quote.sourceCurrency} → {quote.destinationAmount} {quote.destinationCurrency} (fee {quote.feeAmount})
          </div>
        )}
        {result && <div style={{ color: '#16a34a', marginTop: 8 }}>{result}</div>}
      </div>
    </form>
  )
}

function _tabStyle(active: boolean): React.CSSProperties {
  return {
    padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1',
    background: active ? '#0ea5e9' : '#f1f5f9', color: active ? '#ffffff' : '#0f172a',
    fontWeight: 700, cursor: 'pointer'
  }
}

