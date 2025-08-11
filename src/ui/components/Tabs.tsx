import React from 'react'

export type TabKey = string

export interface TabsProps<T extends TabKey> {
  tabs: Array<{ key: T; label: string }>
  value: T
  onChange: (key: T) => void
  ariaLabel?: string
}

export function Tabs<T extends TabKey>({ tabs, value, onChange, ariaLabel }: TabsProps<T>): JSX.Element {
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  function _onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number): void {
    const total = tabs.length
    let nextIndex = index
    switch (event.key) {
      case 'ArrowRight':
      case 'Right':
        nextIndex = (index + 1) % total
        break
      case 'ArrowLeft':
      case 'Left':
        nextIndex = (index - 1 + total) % total
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = total - 1
        break
      default:
        return
    }
    event.preventDefault()
    const nextKey = tabs[nextIndex].key
    onChange(nextKey)
    const container = containerRef.current
    if (!container) return
    const buttons = container.querySelectorAll<HTMLButtonElement>('button[role="tab"]')
    const btn = buttons[nextIndex]
    if (btn) btn.focus()
  }

  return (
    <div ref={containerRef} className="segmented" role="tablist" aria-label={ariaLabel ?? 'Tabs'}>
      {tabs.map((t, idx) => {
        const selected = t.key === value
        return (
          <button
            key={t.key}
            role="tab"
            aria-selected={selected}
            aria-controls={`panel-${String(t.key)}`}
            tabIndex={selected ? 0 : -1}
            onKeyDown={(e) => _onKeyDown(e, idx)}
            onClick={() => onChange(t.key)}
            style={{
              background: selected ? '#ffffff' : undefined,
              borderColor: selected ? 'var(--border)' : undefined,
              color: 'var(--surface-text)'
            }}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}


