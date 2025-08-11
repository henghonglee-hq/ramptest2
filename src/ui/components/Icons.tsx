import React from 'react'
import type { Chain } from '@/types'
import { isFiat } from '@/types'
import btcIcon from 'cryptocurrency-icons/svg/color/btc.svg'
import ethIcon from 'cryptocurrency-icons/svg/color/eth.svg'
import usdcIcon from 'cryptocurrency-icons/svg/color/usdc.svg'
import usdtIcon from 'cryptocurrency-icons/svg/color/usdt.svg'
import solIcon from 'cryptocurrency-icons/svg/color/sol.svg'

interface IconProps {
  size?: number
}

interface CurrencyIconProps extends IconProps {
  code: string
  chain?: Chain
}

export function CurrencyIcon({ code, chain, size = 28 }: CurrencyIconProps): JSX.Element {
  const fiat = isFiat(code as any)
  const cryptoSvg = fiat ? null : _getCryptoSvg(code)
  const { bg, fg, label } = fiat ? _getFiatStyle(code) : _getCurrencyStyle(code)
  const overlayNeeded = chain && _isToken(code)
  const overlay = overlayNeeded ? <ChainBadge chain={chain!} size={Math.round(size * 0.45)} /> : null

  return (
    <div style={{ position: 'relative', width: size, height: size, borderRadius: '50%', overflow: 'hidden', background: '#ffffff' }}>
      {cryptoSvg ? (
        <img src={cryptoSvg} width={size} height={size} alt={`${code} icon`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <svg width={size} height={size} viewBox="0 0 32 32" aria-label={code}>
          <circle cx="16" cy="16" r="16" fill={bg} />
          <text x="16" y="20" textAnchor="middle" fontSize="16" fontWeight={700} fill={fg}> {label} </text>
        </svg>
      )}
      {overlay && (
        <div style={{ position: 'absolute', right: -2, bottom: -2 }}>{overlay}</div>
      )}
    </div>
  )
}

export function ChainBadge({ chain, size = 14 }: { chain: Chain; size?: number }): JSX.Element {
  const { bg, fg, label } = _getChainStyle(chain)
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label={chain} style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.15))' }}>
      <circle cx="12" cy="12" r="12" fill={bg} stroke="#ffffff" strokeWidth="1" />
      <text x="12" y="15" textAnchor="middle" fontSize="10" fontWeight={800} fill={fg}> {label} </text>
    </svg>
  )
}

function _getCurrencyStyle(code: string): { bg: string; fg: string; label: string } {
  const upper = code.toUpperCase()
  switch (upper) {
    case 'BTC':
      return { bg: '#F7931A', fg: '#ffffff', label: '₿' }
    case 'ETH':
      return { bg: '#627EEA', fg: '#ffffff', label: 'Ξ' }
    case 'SOL':
      return { bg: '#14F195', fg: '#0b1221', label: '◎' }
    case 'USDC':
      return { bg: '#2775CA', fg: '#ffffff', label: 'USDC' }
    case 'USDT':
      return { bg: '#26A17B', fg: '#ffffff', label: 'USDT' }
    case 'USD':
      return { bg: '#0ea5e9', fg: '#ffffff', label: '$' }
    case 'EUR':
      return { bg: '#2563eb', fg: '#ffffff', label: '€' }
    case 'GBP':
      return { bg: '#1f2937', fg: '#ffffff', label: '£' }
    case 'SGD':
      return { bg: '#ef4444', fg: '#ffffff', label: 'S$' }
    case 'AUD':
      return { bg: '#10b981', fg: '#0b1221', label: 'A$' }
    default:
      return { bg: '#94a3b8', fg: '#ffffff', label: upper }
  }
}

function _getCryptoSvg(code: string): string | null {
  const upper = code.toUpperCase()
  switch (upper) {
    case 'BTC':
      return btcIcon
    case 'ETH':
      return ethIcon
    case 'USDC':
      return usdcIcon
    case 'USDT':
      return usdtIcon
    case 'SOL':
      return solIcon
    default:
      return null
  }
}

function _getFiatStyle(code: string): { bg: string; fg: string; label: string } {
  const upper = code.toUpperCase()
  switch (upper) {
    case 'USD':
      return { bg: '#ffffff', fg: '#0f172a', label: '🇺🇸' }
    case 'EUR':
      return { bg: '#ffffff', fg: '#0f172a', label: '🇪🇺' }
    case 'GBP':
      return { bg: '#ffffff', fg: '#0f172a', label: '🇬🇧' }
    case 'SGD':
      return { bg: '#ffffff', fg: '#0f172a', label: '🇸🇬' }
    case 'AUD':
      return { bg: '#ffffff', fg: '#0f172a', label: '🇦🇺' }
    default:
      return { bg: '#ffffff', fg: '#0f172a', label: upper }
  }
}

function _getChainStyle(chain: Chain): { bg: string; fg: string; label: string } {
  switch (chain) {
    case 'Ethereum':
      return { bg: '#627EEA', fg: '#ffffff', label: 'E' }
    case 'Solana':
      return { bg: '#14F195', fg: '#0b1221', label: 'S' }
    case 'Polygon':
      return { bg: '#8247E5', fg: '#ffffff', label: 'P' }
    case 'Tron':
      return { bg: '#FF060A', fg: '#ffffff', label: 'T' }
    default:
      return { bg: '#64748b', fg: '#ffffff', label: '?' }
  }
}

function _isToken(code: string): boolean {
  const tokens = new Set(['USDC', 'USDT'])
  return tokens.has(code.toUpperCase())
}

