import React from 'react'
import { Field, Input, Button } from '@/ui/components/FormControls'
import { CurrencySelect } from '@/ui/components/CurrencySelect'
import { PathViz, type PathStep } from '@/ui/components/PathViz'
import type { AnyCurrency, CurrencySelection, FiatCurrency, CryptoCurrency } from '@/types'
import { isFiat } from '@/types'
import { getOnRampQuote, getOffRampQuote, getSwapQuote, submitOnRamp, submitOffRamp, submitSwap } from '@/lib/api'
import { PROVIDERS, getSavedProviderToggles } from '@/lib/providers'

export function ConvertPage(): JSX.Element {
  const [fromCurrency, setFromCurrency] = React.useState<AnyCurrency | CurrencySelection>('USD')
  const [toCurrency, setToCurrency] = React.useState<AnyCurrency | CurrencySelection>({ kind: 'crypto', code: 'USDC', chain: 'Ethereum' })
  const [amount, setAmount] = React.useState('250')
  const [loading, setLoading] = React.useState(false)
  const [quote, setQuote] = React.useState<any | null>(null)
  const [result, setResult] = React.useState<string | null>(null)
  const [showKyc, setShowKyc] = React.useState(false)
  const [showDest, setShowDest] = React.useState(false)

  // KYC and destination account state (shown when destination is fiat)
  const [kyc, setKyc] = React.useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    country: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    idType: 'Passport',
    idNumber: '',
    phone: '',
    email: '',
  })

  const [dest, setDest] = React.useState({
    payoutMethod: 'Bank Transfer',
    accountHolder: '',
    bankName: '',
    accountNumberIban: '',
    swiftBic: '',
    routingNumber: '',
    accountCountry: '',
    notes: '',
  })

  async function handleGetQuote(): Promise<void> {
    setResult(null)
    setLoading(true)
    try {
      const q = await _getQuote({ fromCurrency, toCurrency, amount })
      setQuote(q)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setResult(null)
    setLoading(true)
    try {
      const r = await _submit({ fromCurrency, toCurrency, amount })
      setResult(`Submitted: ${r.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        <Field label="From">
          <CurrencySelect value={fromCurrency} onChange={setFromCurrency} />
        </Field>
        <Field label="Amount">
          <Input type="number" min="0" step="0.0001" value={amount} onChange={e => setAmount(e.target.value)} />
        </Field>
        <Field label="To">
          <CurrencySelect value={toCurrency} onChange={setToCurrency} />
        </Field>
        {(() => {
          const fromCode = typeof fromCurrency === 'string' ? fromCurrency : fromCurrency.code
          const toCode = typeof toCurrency === 'string' ? toCurrency : toCurrency.code
          const fromIsFiat = isFiat(fromCode)
          const toIsFiat = isFiat(toCode)
          const enabled = getSavedProviderToggles()
          const hasRamp = PROVIDERS.some(p => p.category === 'ramp' && enabled[p.id])
          const hasSwap = PROVIDERS.some(p => p.category === 'swap' && enabled[p.id])
          const sameCurrencyOnramp = fromIsFiat && !toIsFiat && _isSameCurrencyOnramp(fromCode as any, toCode as any)
          const needsRamp = (fromIsFiat && !toIsFiat) || (!fromIsFiat && toIsFiat)
          const needsSwap = (!fromIsFiat && !toIsFiat) || (!sameCurrencyOnramp && fromIsFiat && !toIsFiat) || (!fromIsFiat && toIsFiat)
          const missingRamp = needsRamp && !hasRamp
          const missingSwap = needsSwap && !hasSwap
          const blocked = missingRamp || missingSwap
          return (
            <>
              {(missingRamp || missingSwap) && (
                <div className="muted" style={{ background: '#fff7ed', color: '#9a3412', border: '1px solid #fed7aa', borderRadius: 8, padding: '8px 10px' }}>
                  {missingRamp && <span>Enable at least one Ramp provider in Routing. </span>}
                  {missingSwap && <span>Enable at least one Swap provider in Routing. </span>}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button type="button" onClick={handleGetQuote} disabled={loading || blocked}>
                  Get Quote
                </Button>
                <Button type="submit" disabled={loading || !quote || blocked}>
                  Execute Quote
                </Button>
              </div>
            </>
          )
        })()}
      </div>

      {/* Path visualization */}
      {(() => {
        const steps = _buildPathSteps(fromCurrency, toCurrency)
        return <PathViz steps={steps} />
      })()}

      {/* Conditionally render KYC and destination account sections when destination is fiat */}
      {(() => {
        const toCode = typeof toCurrency === 'string' ? toCurrency : toCurrency.code
        const toIsFiat = isFiat(toCode)
        if (!toIsFiat) return null
        return (
          <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            <section style={{ border: '1px solid #e2e8f0', borderRadius: 12 }}>
              <button type="button" onClick={() => setShowKyc(v => !v)} style={{ width: '100%', textAlign: 'left', padding: 12, background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', fontWeight: 800 }}>
                KYC {showKyc ? '▾' : '▸'}
              </button>
              {showKyc && <div style={{ padding: 12 }}>
              <Field label="First name">
                <Input placeholder="Jane" value={kyc.firstName} onChange={e => setKyc({ ...kyc, firstName: e.target.value })} />
              </Field>
              <Field label="Last name">
                <Input placeholder="Doe" value={kyc.lastName} onChange={e => setKyc({ ...kyc, lastName: e.target.value })} />
              </Field>
              <Field label="Date of birth">
                <Input placeholder="1990-07-20" value={kyc.dateOfBirth} onChange={e => setKyc({ ...kyc, dateOfBirth: e.target.value })} />
              </Field>
              <Field label="Country">
                <Input placeholder="United States" value={kyc.country} onChange={e => setKyc({ ...kyc, country: e.target.value })} />
              </Field>
              <Field label="Address line 1">
                <Input placeholder="123 Market Street" value={kyc.address1} onChange={e => setKyc({ ...kyc, address1: e.target.value })} />
              </Field>
              <Field label="Address line 2">
                <Input placeholder="Apt 4B" value={kyc.address2} onChange={e => setKyc({ ...kyc, address2: e.target.value })} />
              </Field>
              <Field label="City">
                <Input placeholder="San Francisco" value={kyc.city} onChange={e => setKyc({ ...kyc, city: e.target.value })} />
              </Field>
              <Field label="State / Province">
                <Input placeholder="CA" value={kyc.state} onChange={e => setKyc({ ...kyc, state: e.target.value })} />
              </Field>
              <Field label="Postal code">
                <Input placeholder="94105" value={kyc.postalCode} onChange={e => setKyc({ ...kyc, postalCode: e.target.value })} />
              </Field>
              <Field label="ID type">
                <Input placeholder="Passport / National ID / Driver License" value={kyc.idType} onChange={e => setKyc({ ...kyc, idType: e.target.value })} />
              </Field>
              <Field label="ID number">
                <Input placeholder="P1234567" value={kyc.idNumber} onChange={e => setKyc({ ...kyc, idNumber: e.target.value })} />
              </Field>
              <Field label="Phone number">
                <Input placeholder="+1 415 555 0100" value={kyc.phone} onChange={e => setKyc({ ...kyc, phone: e.target.value })} />
              </Field>
              <Field label="Email">
                <Input placeholder="jane.doe@example.com" value={kyc.email} onChange={e => setKyc({ ...kyc, email: e.target.value })} />
              </Field>
              </div>}
            </section>

            <section style={{ border: '1px solid #e2e8f0', borderRadius: 12 }}>
              <button type="button" onClick={() => setShowDest(v => !v)} style={{ width: '100%', textAlign: 'left', padding: 12, background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', fontWeight: 800 }}>
                Destination account {showDest ? '▾' : '▸'}
              </button>
              {showDest && <div style={{ padding: 12 }}>
              <Field label="Payout method">
                <Input placeholder="Bank Transfer / Mobile Money" value={dest.payoutMethod} onChange={e => setDest({ ...dest, payoutMethod: e.target.value })} />
              </Field>
              <Field label="Account holder name">
                <Input placeholder="Jane Doe" value={dest.accountHolder} onChange={e => setDest({ ...dest, accountHolder: e.target.value })} />
              </Field>
              <Field label="Bank name">
                <Input placeholder="Chase Bank" value={dest.bankName} onChange={e => setDest({ ...dest, bankName: e.target.value })} />
              </Field>
              <Field label="Account number / IBAN">
                <Input placeholder="GB29 NWBK 6016 1331 9268 19" value={dest.accountNumberIban} onChange={e => setDest({ ...dest, accountNumberIban: e.target.value })} />
              </Field>
              <Field label="SWIFT / BIC">
                <Input placeholder="CHASUS33" value={dest.swiftBic} onChange={e => setDest({ ...dest, swiftBic: e.target.value })} />
              </Field>
              <Field label="Routing number (if applicable)">
                <Input placeholder="021000021" value={dest.routingNumber} onChange={e => setDest({ ...dest, routingNumber: e.target.value })} />
              </Field>
              <Field label="Account country">
                <Input placeholder="United States" value={dest.accountCountry} onChange={e => setDest({ ...dest, accountCountry: e.target.value })} />
              </Field>
              <Field label="Notes (optional)">
                <Input placeholder="Additional instructions..." value={dest.notes} onChange={e => setDest({ ...dest, notes: e.target.value })} />
              </Field>
              </div>}
            </section>
          </div>
        )
      })()}

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

function _getQuote({ fromCurrency, toCurrency, amount }: { fromCurrency: AnyCurrency | CurrencySelection; toCurrency: AnyCurrency | CurrencySelection; amount: string }): Promise<any> {
  const fromCode = typeof fromCurrency === 'string' ? fromCurrency : fromCurrency.code
  const toCode = typeof toCurrency === 'string' ? toCurrency : toCurrency.code
  if (isFiat(fromCode) && !isFiat(toCode)) {
    return getOnRampQuote({ fiatCurrency: fromCode, fiatAmount: amount, cryptoCurrency: toCode as any })
  }
  if (!isFiat(fromCode) && isFiat(toCode)) {
    return getOffRampQuote({ cryptoCurrency: fromCode as any, cryptoAmount: amount, fiatCurrency: toCode })
  }
  return getSwapQuote({ fromCurrency: fromCode as any, toCurrency: toCode as any, fromAmount: amount })
}

async function _submit({ fromCurrency, toCurrency, amount }: { fromCurrency: AnyCurrency | CurrencySelection; toCurrency: AnyCurrency | CurrencySelection; amount: string }): Promise<{ id: string; status: 'pending' }> {
  const fromCode = typeof fromCurrency === 'string' ? fromCurrency : fromCurrency.code
  const toCode = typeof toCurrency === 'string' ? toCurrency : toCurrency.code
  if (isFiat(fromCode) && !isFiat(toCode)) {
    return submitOnRamp({ fiatCurrency: fromCode, fiatAmount: amount, cryptoCurrency: toCode as any })
  }
  if (!isFiat(fromCode) && isFiat(toCode)) {
    return submitOffRamp({ cryptoCurrency: fromCode as any, cryptoAmount: amount, fiatCurrency: toCode })
  }
  return submitSwap({ fromCurrency: fromCode as any, toCurrency: toCode as any, fromAmount: amount })
}

function _buildPathSteps(fromCurrency: AnyCurrency | CurrencySelection, toCurrency: AnyCurrency | CurrencySelection): PathStep[] {
  const fromCode = typeof fromCurrency === 'string' ? fromCurrency : fromCurrency.code
  const toCode = typeof toCurrency === 'string' ? toCurrency : toCurrency.code
  const fromIsFiat = isFiat(fromCode)
  const toIsFiat = isFiat(toCode)
  const enabled = getSavedProviderToggles()
  const rampProviders = PROVIDERS.filter(p => p.category === 'ramp' && enabled[p.id])
  const swapProviders = PROVIDERS.filter(p => p.category === 'swap' && enabled[p.id])

  function randomPick<T>(arr: T[]): T | null {
    if (arr.length === 0) return null
    const idx = Math.floor(Math.random() * arr.length)
    return arr[idx]
  }

  const steps: PathStep[] = []
  if (fromIsFiat && !toIsFiat) {
    const sameCurrency = _isSameCurrencyOnramp(fromCode as FiatCurrency, toCode as CryptoCurrency)
    const rp = randomPick(rampProviders)
    if (rp) steps.push({ kind: 'ramp', providerName: rp.name, feePercent: 1.25, fixedFeeAmount: 1.5, fixedFeeCurrency: fromCode })
    if (!sameCurrency) {
      const sp = randomPick(swapProviders)
      if (sp) steps.push({ kind: 'swap', providerName: sp.name, feePercent: 0.15, fixedFeeAmount: 0, fixedFeeCurrency: toCode })
    }
  } else if (!fromIsFiat && toIsFiat) {
    const sp = randomPick(swapProviders)
    if (sp) steps.push({ kind: 'swap', providerName: sp.name, feePercent: 0.15, fixedFeeAmount: 0, fixedFeeCurrency: fromCode })
    const rp = randomPick(rampProviders)
    if (rp) steps.push({ kind: 'ramp', providerName: rp.name, feePercent: 0.90, fixedFeeAmount: 2.0, fixedFeeCurrency: toCode })
  } else if (!fromIsFiat && !toIsFiat) {
    const sp = randomPick(swapProviders)
    if (sp) steps.push({ kind: 'swap', providerName: sp.name, feePercent: 0.15, fixedFeeAmount: 0, fixedFeeCurrency: fromCode })
  }
  return steps
}

function _isSameCurrencyOnramp(fiat: FiatCurrency, crypto: CryptoCurrency): boolean {
  const stableMatches: Record<FiatCurrency, CryptoCurrency[]> = {
    USD: ['USDC', 'USDT'],
    EUR: [],
    GBP: [],
    SGD: [],
    AUD: [],
  }
  return (stableMatches[fiat] || []).includes(crypto)
}

