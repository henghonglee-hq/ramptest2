# Integration Guide

This guide provides detailed examples for integrating URamp SDK into different types of applications.

## Chrome Extension Integration (Detailed)

### Project Structure
```
my-crypto-extension/
├── manifest.json
├── popup.html
├── popup.tsx
├── background.js
├── vite.config.ts
├── package.json
└── src/
    ├── components/
    ├── utils/
    └── types/
```

### Step-by-Step Setup

1. **Initialize your project**:
```bash
mkdir my-crypto-extension
cd my-crypto-extension
npm init -y
npm install react react-dom uramp-sdk
npm install -D @types/react @types/react-dom @vitejs/plugin-react vite typescript
```

2. **Create manifest.json**:
```json
{
  "manifest_version": 3,
  "name": "My Crypto Wallet",
  "version": "1.0.0",
  "description": "A crypto wallet with ramp functionality",
  "action": {
    "default_popup": "popup.html",
    "default_title": "My Crypto Wallet"
  },
  "permissions": [
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "https://*/*"
  ],
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

3. **Create popup.html**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Crypto Wallet</title>
    <style>
        body {
            width: 380px;
            height: 600px;
            margin: 0;
            padding: 0;
        }
        #root {
            width: 100%;
            height: 100%;
        }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/popup.tsx"></script>
</body>
</html>
```

Note: Manifest V3 disallows inline scripts on extension pages. Keep all logic in external files (as in step 4), or reference built JS bundles via `<script src="...">`.

4. **Create src/popup.tsx** (one-liner mount):
```tsx
import { mountURamp } from 'uramp-sdk'
import 'uramp-sdk/styles'

mountURamp('#root', { isExtensionPopup: true })
```

5. **Create vite.config.ts**:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html')
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
});
```

6. **Update package.json scripts**:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

7. **Build and test**:
```bash
npm run build
```

Then load the `dist` folder as an unpacked extension in Chrome.

### UMD (no bundler) for Extensions

If you prefer not to use a bundler in your extension:

1. Copy `dist/uramp.umd.js` and `dist/style.css` into your extension package.
2. Reference them from your `popup.html` and place your mount code in an external `popup.js`:

```html
<!-- popup.html -->
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="./style.css" />
  </head>
  <body>
    <div id="root"></div>
    <script src="./uramp.umd.js"></script>
    <script src="./popup.js"></script>
  </body>
  </html>
```

```js
// popup.js (MV3 safe: no inline script)
const { mountURamp } = window.URampSDK
mountURamp('#root', { isExtensionPopup: true })
```

## Custom Wallet Integration

### With State Management (Redux/Zustand)

```tsx
// store/walletStore.ts
import { create } from 'zustand';

interface WalletState {
  address: string | null;
  balance: Record<string, number>;
  setAddress: (address: string) => void;
  updateBalance: (token: string, amount: number) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  balance: {},
  setAddress: (address) => set({ address }),
  updateBalance: (token, amount) => 
    set((state) => ({
      balance: { ...state.balance, [token]: amount }
    }))
}));

// components/WalletWithRamp.tsx
import React from 'react';
import { URampApp } from 'uramp-sdk';
import { useWalletStore } from '../store/walletStore';

export function WalletWithRamp() {
  const { address, balance } = useWalletStore();

  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <h2>Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}</h2>
        <div className="balance">
          {Object.entries(balance).map(([token, amount]) => (
            <div key={token}>{token}: {amount}</div>
          ))}
        </div>
      </div>
      
      <URampApp />
    </div>
  );
}
```

### With Web3 Integration

```tsx
// hooks/useWeb3.ts
import { useState, useEffect } from 'react';

export function useWeb3() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  useEffect(() => {
    // Web3 connection logic
    const connectWallet = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        setAccount(accounts[0]);
        
        const chainId = await window.ethereum.request({
          method: 'eth_chainId'
        });
        setChainId(parseInt(chainId, 16));
      }
    };
    
    connectWallet();
  }, []);

  return { account, chainId };
}

// components/Web3Wallet.tsx
import React from 'react';
import { URampApp } from 'uramp-sdk';
import { useWeb3 } from '../hooks/useWeb3';

export function Web3Wallet() {
  const { account, chainId } = useWeb3();

  if (!account) {
    return <div>Please connect your wallet</div>;
  }

  return (
    <div>
      <div className="wallet-info">
        <p>Account: {account}</p>
        <p>Chain ID: {chainId}</p>
      </div>
      <URampApp />
    </div>
  );
}
```

## Mobile App Integration (WebView)

### React Native Example

```tsx
// components/RampWebView.tsx
import React from 'react';
import { WebView } from 'react-native-webview';
import { View, StyleSheet } from 'react-native';

const HTML_CONTENT = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/uramp-sdk/dist/uramp.umd.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/uramp-sdk/dist/style.css">
    <style>
        body { margin: 0; font-family: system-ui; }
        .container { padding: 16px; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script>
        const { URampApp } = URampSDK;
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement('div', { className: 'container' }, 
          React.createElement(URampApp)
        ));
    </script>
</body>
</html>
`;

export function RampWebView() {
  return (
    <View style={styles.container}>
      <WebView
        source={{ html: HTML_CONTENT }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
```

## Desktop App Integration (Electron)

### Electron Setup

```typescript
// src/main/main.ts
import { app, BrowserWindow } from 'electron';
import * as path from 'path';

function createWindow() {
  const mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

// src/renderer/App.tsx
import React from 'react';
import { URampApp } from 'uramp-sdk';
import 'uramp-sdk/styles';

function App() {
  return (
    <div className="electron-app">
      <div className="title-bar">
        <h1>My Desktop Crypto Wallet</h1>
      </div>
      <div className="main-content">
        <URampApp />
      </div>
    </div>
  );
}

export default App;
```

## Advanced Customization

### Custom Theme Provider

```tsx
// theme/ThemeProvider.tsx
import React, { createContext, useContext, useState } from 'react';

interface Theme {
  colors: {
    primary: string;
    background: string;
    text: string;
  };
  spacing: {
    small: number;
    medium: number;
    large: number;
  };
}

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = useState<Theme>({
    colors: {
      primary: '#3b82f6',
      background: '#ffffff',
      text: '#1f2937'
    },
    spacing: {
      small: 8,
      medium: 16,
      large: 24
    }
  });

  React.useEffect(() => {
    // Apply theme to CSS variables
    const root = document.documentElement;
    root.style.setProperty('--uramp-primary-color', theme.colors.primary);
    root.style.setProperty('--uramp-background-color', theme.colors.background);
    root.style.setProperty('--uramp-text-color', theme.colors.text);
  }, [theme]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

// Usage
import { ThemeProvider } from './theme/ThemeProvider';
import { URampApp } from 'uramp-sdk';

function App() {
  return (
    <ThemeProvider>
      <URampApp />
    </ThemeProvider>
  );
}
```

This integration guide covers the most common scenarios for implementing URamp SDK in various environments. For more specific use cases or additional help, please refer to the main README or create an issue in the repository.