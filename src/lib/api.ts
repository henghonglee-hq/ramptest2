import type { Quote, ActivityItem, CryptoCurrency, FiatCurrency } from '@/types'

// Public functions up top

/**
 * Return a simulated onramp quote for converting fiat to crypto.
 */
export async function getOnRampQuote(params: {
  fiatCurrency: FiatCurrency
  fiatAmount: string
  cryptoCurrency: CryptoCurrency
}): Promise<Quote> {
  return _simulateQuote({
    sourceCurrency: params.fiatCurrency,
    destinationCurrency: params.cryptoCurrency,
    sourceAmount: params.fiatAmount,
  })
}

/**
 * Return a simulated offramp quote for converting crypto to fiat.
 */
export async function getOffRampQuote(params: {
  cryptoCurrency: CryptoCurrency
  cryptoAmount: string
  fiatCurrency: FiatCurrency
}): Promise<Quote> {
  return _simulateQuote({
    sourceCurrency: params.cryptoCurrency,
    destinationCurrency: params.fiatCurrency,
    sourceAmount: params.cryptoAmount,
  })
}

/**
 * Return a simulated swap quote for converting between crypto assets.
 */
export async function getSwapQuote(params: {
  fromCurrency: CryptoCurrency
  toCurrency: CryptoCurrency
  fromAmount: string
}): Promise<Quote> {
  return _simulateQuote({
    sourceCurrency: params.fromCurrency,
    destinationCurrency: params.toCurrency,
    sourceAmount: params.fromAmount,
  })
}

/**
 * Simulate submitting an onramp order; returns a pending id.
 */
export async function submitOnRamp(_: {
  fiatCurrency: FiatCurrency
  fiatAmount: string
  cryptoCurrency: CryptoCurrency
  paymentMethodId?: string
}): Promise<{ id: string; status: 'pending' }> {
  await _delay(800)
  return { id: crypto.randomUUID(), status: 'pending' }
}

/**
 * Simulate submitting an offramp order; returns a pending id.
 */
export async function submitOffRamp(_: {
  cryptoCurrency: CryptoCurrency
  cryptoAmount: string
  fiatCurrency: FiatCurrency
  payoutMethodId?: string
}): Promise<{ id: string; status: 'pending' }> {
  await _delay(800)
  return { id: crypto.randomUUID(), status: 'pending' }
}

/**
 * Simulate submitting a crypto swap; returns a pending id.
 */
export async function submitSwap(_: {
  fromCurrency: CryptoCurrency
  toCurrency: CryptoCurrency
  fromAmount: string
}): Promise<{ id: string; status: 'pending' }> {
  await _delay(800)
  return { id: crypto.randomUUID(), status: 'pending' }
}

/**
 * Return a recent activity list (simulated).
 */
export async function listActivity(): Promise<ActivityItem[]> {
  await _delay(400)
  return [
    {
      id: 'a1',
      type: 'onramp',
      status: 'completed',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      description: 'Bought 250 USDC with 250 USD',
    },
    {
      id: 'a2',
      type: 'swap',
      status: 'pending',
      createdAt: new Date().toISOString(),
      description: 'Swapping 0.01 BTC to USDC',
    },
  ]
}

// Private helpers below

async function _simulateQuote(input: {
  sourceCurrency: string
  destinationCurrency: string
  sourceAmount: string
}): Promise<Quote> {
  await _delay(300)
  const sourceAmount = Number(input.sourceAmount || '0')
  const rate = _fakeRate(input.sourceCurrency, input.destinationCurrency)
  const grossDestination = sourceAmount * rate
  const fee = Math.max(1, grossDestination * 0.01)
  const destinationAmount = Math.max(0, grossDestination - fee)
  return {
    id: crypto.randomUUID(),
    sourceCurrency: input.sourceCurrency,
    destinationCurrency: input.destinationCurrency,
    sourceAmount: sourceAmount.toFixed(2),
    destinationAmount: destinationAmount.toFixed(2),
    feeAmount: fee.toFixed(2),
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  }
}

function _fakeRate(from: string, to: string): number {
  const key = `${from}-${to}`
  const table: Record<string, number> = {
    'USD-USDC': 1,
    'USD-USDT': 1,
    'USD-BTC': 1 / 60000,
    'USD-ETH': 1 / 3000,
    'USD-SOL': 1 / 150,
    'USDC-USD': 1,
    'USDT-USD': 1,
    'BTC-USD': 60000,
    'ETH-USD': 3000,
    'SOL-USD': 150,
    'USDC-USDT': 1,
    'USDT-USDC': 1,
    'BTC-USDC': 60000,
    'USDC-BTC': 1 / 60000,
    'ETH-USDC': 3000,
    'USDC-ETH': 1 / 3000,
    'SOL-USDC': 150,
    'USDC-SOL': 1 / 150,
  }
  return table[key] ?? 1
}

function _delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

