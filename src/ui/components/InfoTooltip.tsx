import React from 'react'

interface InfoTooltipProps {
  text: string
}

export function InfoTooltip({ text }: InfoTooltipProps): JSX.Element {
  const [open, setOpen] = React.useState(false)
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        aria-label="Info"
        onClick={() => setOpen(o => !o)}
        onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false) }}
        style={{
          width: 18,
          height: 18,
          borderRadius: 999,
          border: '1px solid #cbd5e1',
          background: '#f8fafc',
          color: '#0f172a',
          fontSize: 11,
          lineHeight: '16px',
          cursor: 'pointer',
          padding: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        i
      </button>
      {open && (
        <div
          className="dropdown-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            background: '#fff',
            padding: 12,
            minWidth: 220,
            maxWidth: 280,
            zIndex: 40,
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            boxShadow: '0 16px 44px rgba(2,6,23,0.14)'
          }}
        >
          <div style={{ fontSize: 13, lineHeight: 1.35, color: '#111827', fontWeight: 400 }}>{text}</div>
        </div>
      )}
    </span>
  )
}

