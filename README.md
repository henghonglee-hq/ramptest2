# URamp SDK

A React SDK for crypto wallet ramp and swap functionality. This package provides pre-built UI components and utilities for integrating on-ramp, off-ramp, and swap features into crypto wallets and applications.

## Features

- 🔄 **Swap**: Cryptocurrency exchange functionality
- 💰 **On-Ramp**: Fiat to crypto conversion
- 💳 **Off-Ramp**: Crypto to fiat conversion
- 📊 **Activity Tracking**: Transaction history and monitoring
- 🛣️ **Routing**: Multi-hop swap path optimization
- 🎨 **Customizable UI**: Pre-built React components with styling
- 📱 **Responsive Design**: Mobile and desktop friendly
- 🔧 **TypeScript Support**: Full type definitions included

## Installation

```bash
npm install uramp-sdk
# or
yarn add uramp-sdk
# or
pnpm add uramp-sdk
```

### Peer Dependencies

This package requires React 16.8+ as a peer dependency:

```bash
npm install react react-dom
```

## Quick Start

### Basic Integration (React)

```tsx
import React from 'react';
import { URampApp } from 'uramp-sdk';
import 'uramp-sdk/styles';

function App() {
  return (
    <div className="App">
      <URampApp />
    </div>
  );
}

export default App;
```

### Script tag + one-line mount (UMD)

```html
<link rel="stylesheet" href="/path/to/uramp/style.css" />
<div id="uramp-root"></div>
<script src="/path/to/uramp/uramp.umd.js"></script>
<script>
  const { mountURamp } = window.URampSDK;
  mountURamp('#uramp-root');
  // For extension popup footprint:
  // mountURamp('#uramp-root', { isExtensionPopup: true })
  // Later: const handle = mountURamp(...); handle.unmount()
  // to clean up when closing the popup
  
</script>
```

### Individual Components

```tsx
import React, { useState } from 'react';
import { ConvertPage, SwapPage, ActivityPage } from 'uramp-sdk';
import 'uramp-sdk/styles';

function MyWallet() {
  const [activeTab, setActiveTab] = useState('convert');

  return (
    <div>
      <nav>
        <button onClick={() => setActiveTab('convert')}>Convert</button>
        <button onClick={() => setActiveTab('swap')}>Swap</button>
        <button onClick={() => setActiveTab('activity')}>Activity</button>
      </nav>
      
      {activeTab === 'convert' && <ConvertPage />}
      {activeTab === 'swap' && <SwapPage />}
      {activeTab === 'activity' && <ActivityPage />}
    </div>
  );
}
```

### mountURamp API

The SDK exposes a one-line mount helper for non-React or script-tag integrations.

```ts
type MountOptions = {
  isExtensionPopup?: boolean; // adjust layout density for extension popups
  theme?: 'light' | 'dark';   // UI theme (default: 'dark')
}

const handle = mountURamp('#uramp-root', { isExtensionPopup: true, theme: 'light' })
// ... later, to clean up
handle.unmount()
```

## Chrome Extension Integration

### Manifest V3 Setup

1. **Add to manifest.json**:

```json
{
  "manifest_version": 3,
  "name": "My Crypto Wallet",
  "version": "1.0.0",
  "action": {
    "default_popup": "popup.html"
  },
  "permissions": [
    "activeTab",
    "storage"
  ],
  "host_permissions": [
    "https://*/*"
  ]
}
```

2. **Create popup.html**:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crypto Wallet</title>
</head>
<body>
    <div id="root"></div>
    <script src="popup.js"></script>
</body>
</html>
```

3. **Create popup.tsx** (one-liner mount):

```tsx
import { mountURamp } from 'uramp-sdk';
import 'uramp-sdk/styles';

mountURamp('#root', { isExtensionPopup: true });
```

4. **Build Configuration** (using Vite):

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: 'popup.html'
      }
    }
  }
});
```

### Webpack Integration

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/popup.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'popup.js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  }
};
```

## API Reference

### Components

#### `<URampApp />`
The main application component with full functionality.

```tsx
import { URampApp } from 'uramp-sdk';

<URampApp />
```

#### `<ConvertPage />`
On-ramp and off-ramp functionality.

```tsx
import { ConvertPage } from 'uramp-sdk';

<ConvertPage />
```

#### `<SwapPage />`
Cryptocurrency swap interface.

```tsx
import { SwapPage } from 'uramp-sdk';

<SwapPage />
```

#### `<ActivityPage />`
Transaction history and activity monitoring.

```tsx
import { ActivityPage } from 'uramp-sdk';

<ActivityPage />
```

#### `<RoutingPage />`
Routing configuration and path visualization.

```tsx
import { RoutingPage } from 'uramp-sdk';

<RoutingPage />
```

### Utility Components

#### `<Navigation />`
Tab navigation component.

```tsx
import { Navigation } from 'uramp-sdk';

<Navigation 
  value={activeTab} 
  onChange={setActiveTab}
/>
```

#### `<CurrencySelect />`
Cryptocurrency selection dropdown.

```tsx
import { CurrencySelect } from 'uramp-sdk';

<CurrencySelect 
  value={selectedCurrency}
  onChange={setCurrency}
/>
```

#### `<Logo />`
URamp logo component.

```tsx
import { Logo } from 'uramp-sdk';

<Logo size={32} withWordmark={true} />
```

## Integration Examples

### Next.js Integration

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app';
import 'uramp-sdk/styles';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

// pages/wallet.tsx
import { URampApp } from 'uramp-sdk';

export default function Wallet() {
  return (
    <div>
      <h1>My Crypto Wallet</h1>
      <URampApp />
    </div>
  );
}
```

### React Native / Expo Integration

For React Native projects, you'll need to use a web view or create platform-specific implementations as this package uses DOM-specific APIs.

### Electron Integration

```tsx
// src/renderer/App.tsx
import React from 'react';
import { URampApp } from 'uramp-sdk';
import 'uramp-sdk/styles';

function App() {
  return (
    <div style={{ height: '100vh' }}>
      <URampApp />
    </div>
  );
}

export default App;
```

## Styling and Customization

### CSS Variables

Override default styles using CSS variables:

```css
:root {
  --uramp-primary-color: #your-brand-color;
  --uramp-background-color: #your-bg-color;
  --uramp-text-color: #your-text-color;
  --uramp-border-radius: 8px;
  --uramp-font-family: 'Your Font', sans-serif;
}
```

### Custom Styling

```css
/* Override component styles */
.uramp-app {
  max-width: 400px;
  margin: 0 auto;
}

.uramp-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: var(--uramp-border-radius);
}
```

## Development

### Running the Development Server

```bash
npm run dev
```

### Building the SDK

```bash
npm run build
```

### Type Checking

```bash
npm run typecheck
```

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/your-repo/uramp-sdk/issues)
- Documentation: [View docs](https://your-docs-site.com)

---

Made with ❤️ for the crypto community