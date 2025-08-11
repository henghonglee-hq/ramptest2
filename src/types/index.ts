export type FiatCurrency = 'USD' | 'EUR' | 'GBP' | 'SGD' | 'AUD'
export type CryptoCurrency = 'USDC' | 'USDT' | 'BTC' | 'ETH' | 'SOL'
export type Chain = 'Ethereum' | 'Solana' | 'Polygon' | 'Tron'

export interface Quote {
  id: string
  sourceCurrency: string
  destinationCurrency: string
  sourceAmount: string
  destinationAmount: string
  feeAmount: string
  expiresAt: string
}

export interface ActivityItem {
  id: string
  type: 'onramp' | 'offramp' | 'swap'
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
  description: string
}

// Public constants for available currencies
export const FIAT_CURRENCIES: FiatCurrency[] = ['USD', 'EUR', 'GBP', 'SGD', 'AUD']
export const CRYPTO_CURRENCIES: CryptoCurrency[] = ['USDC', 'USDT', 'BTC', 'ETH', 'SOL']
export type AnyCurrency = FiatCurrency | CryptoCurrency

export function isFiat(code: AnyCurrency): code is FiatCurrency {
  return (FIAT_CURRENCIES as string[]).includes(code)
}

export function isCrypto(code: AnyCurrency): code is CryptoCurrency {
  return (CRYPTO_CURRENCIES as string[]).includes(code)
}

export interface CurrencySelectionBase<TCode extends AnyCurrency> {
  kind: 'fiat' | 'crypto'
  code: TCode
  chain?: Chain
}

export type CurrencySelection =
  | CurrencySelectionBase<FiatCurrency>
  | CurrencySelectionBase<CryptoCurrency>

export const SUPPORTED_TOKEN_CHAINS: Record<CryptoCurrency, Chain[] | undefined> = {
  USDC: ['Ethereum', 'Solana', 'Polygon'],
  USDT: ['Ethereum', 'Tron', 'Polygon'],
  BTC: undefined,
  ETH: undefined,
  SOL: undefined,
}

export function isTokenCurrency(code: CryptoCurrency): boolean {
  return Boolean(SUPPORTED_TOKEN_CHAINS[code])
}

export function shortChainCode(chain: Chain): string {
  switch (chain) {
    case 'Ethereum':
      return 'ETH'
    case 'Solana':
      return 'SOL'
    case 'Polygon':
      return 'POLY'
    case 'Tron':
      return 'TRON'
    default:
      return chain
  }
}

