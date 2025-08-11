import React from 'react'

interface SwitchProps {
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md'
}

export function Switch({ checked, onChange, disabled = false, size = 'md' }: SwitchProps): JSX.Element {
  const width = size === 'sm' ? 36 : 44
  const height = size === 'sm' ? 20 : 24
  const knob = size === 'sm' ? 16 : 20
  const padding = (height - knob) / 2

  function handleClick(): void {
    if (disabled) return
    onChange(!checked)
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={handleClick}
      disabled={disabled}
      style={{
        width,
        height,
        background: checked ? '#0ea5e9' : '#e2e8f0',
        border: '1px solid ' + (checked ? '#0ea5e9' : '#cbd5e1'),
        borderRadius: height,
        position: 'relative',
        transition: 'background 120ms ease, border-color 120ms ease',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: padding,
          left: checked ? width - knob - padding - 2 : padding,
          width: knob,
          height: knob,
          background: '#ffffff',
          borderRadius: knob,
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
          transition: 'left 120ms ease',
        }}
      />
    </button>
  )
}

