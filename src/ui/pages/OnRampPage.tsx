import React from 'react'
import { Field, Input, Select, Button } from '@/ui/components/FormControls'
import type { CryptoCurrency, FiatCurrency } from '@/types'
import { getOnRampQuote, submitOnRamp } from '@/lib/api'

const FIAT: FiatCurrency[] = ['USD', 'EUR', 'GBP', 'SGD', 'AUD']
const CRYPTO: CryptoCurrency[] = ['USDC', 'USDT', 'BTC', 'ETH', 'SOL']

export function OnRampPage(): JSX.Element {
  const [fiatCurrency, setFiatCurrency] = React.useState<FiatCurrency>('USD')
  const [cryptoCurrency, setCryptoCurrency] = React.useState<CryptoCurrency>('USDC')
  const [fiatAmount, setFiatAmount] = React.useState('250')
  const [loading, setLoading] = React.useState(false)
  const [quote, setQuote] = React.useState<Awaited<ReturnType<typeof getOnRampQuote>> | null>(null)
  const [result, setResult] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    getOnRampQuote({ fiatCurrency, fiatAmount, cryptoCurrency })
      .then(q => { if (!cancelled) setQuote(q) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [fiatCurrency, cryptoCurrency, fiatAmount])

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setResult(null)
    setLoading(true)
    try {
      const r = await submitOnRamp({ fiatCurrency, fiatAmount, cryptoCurrency })
      setResult(`Submitted: ${r.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Pay with">
          <Select value={fiatCurrency} onChange={e => setFiatCurrency(e.target.value as FiatCurrency)}>
            {FIAT.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Amount">
          <Input type="number" min="0" step="0.01" value={fiatAmount} onChange={e => setFiatAmount(e.target.value)} />
        </Field>
        <Field label="Receive">
          <Select value={cryptoCurrency} onChange={e => setCryptoCurrency(e.target.value as CryptoCurrency)}>
            {CRYPTO.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
        <div style={{ alignSelf: 'end' }}>
          <Button type="submit" disabled={loading}>Buy</Button>
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

