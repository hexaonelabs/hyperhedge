# HyperHedge

![HyperHedge Banner](https://via.placeholder.com/800x200/1a1a1a/0ea5e9?text=HyperHedge)

**Earn Passive Income with Funding Fee Arbitrage on Hyperliquid**

HyperHedge is a sophisticated DeFi application that enables users to create automated hedge positions combining perpetual futures and spot holdings on the Hyperliquid protocol. Capture funding rate premiums while maintaining market-neutral exposure.

## 🚀 Features

- **Automated Hedge Positions**: Create market-neutral positions that earn from funding rate arbitrage
- **Real-time Analytics**: Monitor funding rates, portfolio performance, and market data
- **Risk Management**: Built-in risk controls and position monitoring
- **Multiple Markets**: Access to all available Hyperliquid markets
- **Watch Mode**: Monitor positions without active trading

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- A Web3 wallet (MetaMask, WalletConnect, etc.)
- Hyperliquid account and API keys

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/hexaonelabs/hyperhedge.git
cd hyperhedge
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for production

```bash
npm run build
```

### 5. Deploy to Firebase (optional)

```bash
npm run deploy
```

## 🔧 Configuration

### Environment Setup

The application supports both Hyperliquid mainnet and testnet environments. You can configure this through the UI:

1. Connect your wallet
2. Open the Hyperliquid Configuration modal
3. Select your preferred environment (Mainnet/Testnet)
4. Configure your API wallet and sub-account address
5. Save your configuration

### API Keys

Your Hyperliquid API keys are securely stored locally in your browser and encrypted using your wallet signature. The application never sends your private keys to any external server.

## 📖 How It Works

### 1. Connect & Deposit
Connect your wallet and setup API keys to start creating hedge positions on Hyperliquid.

### 2. Monitor Markets
Analyze funding rates across different markets to identify profitable opportunities.

### 3. Create Positions
Set up automated hedge positions that capture funding rate premiums while maintaining market neutrality.

## 🎯 Key Components

- **Portfolio Dashboard**: Overview of your positions and performance
- **Market Analytics**: Real-time funding rates and market data
- **Position Management**: Create and monitor hedge positions
- **Risk Management**: Built-in controls and alerts
- **Configuration**: Secure API key and account management

## 🔒 Security

- **Local Storage**: All sensitive data is stored locally in your browser
- **Wallet Encryption**: API keys are encrypted using your wallet signature
- **No Server Storage**: Private keys never leave your device
- **Open Source**: Full transparency of the codebase

## 📊 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run deploy` - Build and deploy to Firebase

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
