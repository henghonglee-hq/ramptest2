import React from 'react'
import { Field, Input, Select, Button } from '@/ui/components/FormControls'
import type { CryptoCurrency, FiatCurrency } from '@/types'
import { getOffRampQuote, submitOffRamp } from '@/lib/api'

const FIAT: FiatCurrency[] = ['USD', 'EUR', 'GBP', 'SGD', 'AUD']
const CRYPTO: CryptoCurrency[] = ['USDC', 'USDT', 'BTC', 'ETH', 'SOL']

export function OffRampPage(): JSX.Element {
  const [fiatCurrency, setFiatCurrency] = React.useState<FiatCurrency>('USD')
  const [cryptoCurrency, setCryptoCurrency] = React.useState<CryptoCurrency>('USDC')
  const [cryptoAmount, setCryptoAmount] = React.useState('250')
  const [loading, setLoading] = React.useState(false)
  const [quote, setQuote] = React.useState<Awaited<ReturnType<typeof getOffRampQuote>> | null>(null)
  const [result, setResult] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    getOffRampQuote({ cryptoCurrency, cryptoAmount, fiatCurrency })
      .then(q => { if (!cancelled) setQuote(q) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [fiatCurrency, cryptoCurrency, cryptoAmount])

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setResult(null)
    setLoading(true)
    try {
      const r = await submitOffRamp({ fiatCurrency, cryptoAmount, cryptoCurrency })
      setResult(`Submitted: ${r.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Sell">
          <Select value={cryptoCurrency} onChange={e => setCryptoCurrency(e.target.value as CryptoCurrency)}>
            {CRYPTO.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Amount">
          <Input type="number" min="0" step="0.0001" value={cryptoAmount} onChange={e => setCryptoAmount(e.target.value)} />
        </Field>
        <Field label="Receive">
          <Select value={fiatCurrency} onChange={e => setFiatCurrency(e.target.value as FiatCurrency)}>
            {FIAT.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
        <div style={{ alignSelf: 'end' }}>
          <Button type="submit" disabled={loading}>Sell</Button>
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

