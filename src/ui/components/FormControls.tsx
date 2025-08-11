import React from 'react'

export function Field({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <label style={{ display: 'block', marginBottom: 16 }}>
      <div style={{ fontSize: 12, color: '#475569', marginBottom: 6 }}>{label}</div>
      {children}
    </label>
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>): JSX.Element {
  return (
    <input
      {...props}
      style={{
        width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1',
        background: '#ffffff'
      }}
    />
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>): JSX.Element {
  return (
    <select
      {...props}
      style={{
        width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1',
        background: '#ffffff'
      }}
    />
  )
}

export function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element {
  return (
    <button
      {...props}
      className="btn"
      style={{ padding: '5px 7px' }}
    >
      {children}
    </button>
  )
}

