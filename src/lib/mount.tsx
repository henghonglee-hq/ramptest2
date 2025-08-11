import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/ui/App'

export type MountOptions = {
  isExtensionPopup?: boolean
  theme?: 'light' | 'dark'
}

// Public API on top
/**
 * Mount the uRamp app into a DOM container.
 * Returns an unmount handle for cleanup.
 */
export function mountURamp(
  container: string | Element,
  options?: MountOptions
): { unmount: () => void } {
  const element = typeof container === 'string'
    ? document.querySelector(container)
    : container

  if (!element) {
    throw new Error('URamp mount target not found')
  }

  const root = createRoot(element as Element)
  root.render(
    <App
      isExtensionPopup={options?.isExtensionPopup === true}
      theme={options?.theme ?? 'dark'}
    />
  )

  // Private helpers below (none)
  return {
    unmount(): void {
      root.unmount()
    }
  }
}


