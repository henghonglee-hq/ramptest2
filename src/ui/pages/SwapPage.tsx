import React from 'react'
import { Field, Input, Select, Button } from '@/ui/components/FormControls'
import type { CryptoCurrency } from '@/types'
import { getSwapQuote, submitSwap } from '@/lib/api'

const CRYPTO: CryptoCurrency[] = ['USDC', 'USDT', 'BTC', 'ETH', 'SOL']

export function SwapPage(): JSX.Element {
  const [fromCurrency, setFromCurrency] = React.useState<CryptoCurrency>('USDC')
  const [toCurrency, setToCurrency] = React.useState<CryptoCurrency>('USDT')
  const [fromAmount, setFromAmount] = React.useState('100')
  const [loading, setLoading] = React.useState(false)
  const [quote, setQuote] = React.useState<Awaited<ReturnType<typeof getSwapQuote>> | null>(null)
  const [result, setResult] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    getSwapQuote({ fromCurrency, toCurrency, fromAmount })
      .then(q => { if (!cancelled) setQuote(q) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [fromCurrency, toCurrency, fromAmount])

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setResult(null)
    setLoading(true)
    try {
      const r = await submitSwap({ fromCurrency, toCurrency, fromAmount })
      setResult(`Submitted: ${r.id}`)
    } finally {
      setLoading(false)
    }
  }

  const availableToOptions = CRYPTO.filter(c => c !== fromCurrency)

  return (
    <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="From">
          <Select value={fromCurrency} onChange={e => setFromCurrency(e.target.value as CryptoCurrency)}>
            {CRYPTO.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Amount">
          <Input type="number" min="0" step="0.0001" value={fromAmount} onChange={e => setFromAmount(e.target.value)} />
        </Field>
        <Field label="To">
          <Select value={toCurrency} onChange={e => setToCurrency(e.target.value as CryptoCurrency)}>
            {availableToOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
        <div style={{ alignSelf: 'end' }}>
          <Button type="submit" disabled={loading}>Swap</Button>
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

