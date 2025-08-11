import React from 'react'

interface LogoProps {
  size?: number
  withWordmark?: boolean
}

export function Logo({ size = 28, withWordmark = false }: LogoProps): JSX.Element {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        role="img"
        aria-label="uRamp 2.0"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(34,211,238,0.35))' }}
      >
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(99,102,241,0.35)" />
            <stop offset="100%" stopColor="rgba(99,102,241,0)" />
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill="url(#glow)" />
        <circle cx="32" cy="32" r="22" fill="none" stroke="url(#g1)" strokeWidth="4" />
        <path
          d="M18 36c0 8 6 12 14 12s14-4 14-12V22c0-2.2-1.8-4-4-4s-4 1.8-4 4v14c0 3.6-2.9 6-6 6s-6-2.4-6-6V22c0-2.2-1.8-4-4-4s-4 1.8-4 4v14z"
          fill="url(#g1)"
        />
        <circle cx="46" cy="46" r="5" fill="#ffffff" />
        <circle cx="46" cy="46" r="3" fill="#0ea5e9" />
      </svg>
      {withWordmark && (
        <span style={{
          fontWeight: 800,
          letterSpacing: 0.3,
          fontSize: Math.max(16, Math.round(size * 0.7)),
          background: 'linear-gradient(135deg, #ffffff, #a5b4fc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          uRamp 2.0
        </span>
      )}
    </div>
  )
}

