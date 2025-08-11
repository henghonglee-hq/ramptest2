import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './ui/App'
import './ui/styles.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element #root not found')
}

const root = createRoot(rootElement)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

