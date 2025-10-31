# YIFY Finance - veNFT & NFT RWA Lending Platform

A React-based frontend for the YIFY Finance NFT lending protocol, supporting veNFT (voting escrow NFTs) and NFT RWA (Real World Assets).

## Features

- **Wallet Connection**: MetaMask, Coinbase Wallet, WalletConnect support
- **NFT Gallery**: View and manage veNFT & NFT RWA collections
- **Deposit Interface**: Deposit NFTs as collateral
- **Borrow Interface**: Borrow USDC against NFT collateral
- **Portfolio Dashboard**: Track positions and performance
- **Repay Interface**: Repay loans with flexible options
- **Position Management**: Advanced position management tools
- **🏦 Lender Dashboard**: Complete lending interface for providing liquidity
  - **Lending Markets**: Browse and compare available lending pools
  - **Supply Liquidity**: Deposit assets to earn interest
  - **Lending Positions**: View active positions and earnings
  - **Withdraw Funds**: Withdraw deposited assets with optional fees
  - **Transaction History**: Track all lending activities

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Web3**: Wagmi + RainbowKit
- **Forms**: React Hook Form
- **State Management**: TanStack Query

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/          # React components
│   ├── WalletConnection.tsx
│   ├── NFTGallery.tsx
│   ├── DepositInterface.tsx
│   ├── BorrowInterface.tsx
│   ├── PortfolioDashboard.tsx
│   ├── RepayInterface.tsx
│   ├── PositionManagement.tsx
│   ├── LenderMenu.tsx              # Main lender dashboard router
│   └── lender/                      # Lender sub-components
│       ├── LendingMarkets.tsx       # Browse available pools
│       ├── LenderDeposit.tsx        # Supply liquidity
│       ├── LenderPositions.tsx      # View positions & history
│       └── LenderWithdraw.tsx       # Withdraw funds
├── lib/                # Utilities and configurations
│   └── wagmi.ts       # Web3 configuration
├── hooks/             # Custom React hooks
├── pages/             # Page components
└── main.tsx          # Application entry point
```

## Lender Features

### 🏦 Lending Markets
View all available lending pools with:
- Asset type and symbol
- Current APY rates
- Total deposits and utilization
- Pool utilization bars
- One-click deposit buttons

### 💰 Supply Liquidity
Deposit your assets to earn interest:
- Multi-asset pool support (USDC, USDT, DAI, and other Base ecosystem tokens)
- Real-time interest calculations
- Monthly interest projections
- 1-year earning estimates
- Automatic balance updates

### 📊 Lending Positions
Manage your lending portfolio:
- **Portfolio Summary**: Total deposited, current value, earned interest, monthly earnings
- **Active Positions Tab**: Detailed view of each lending position
  - Deposited amount and current value
  - Interest earned and monthly interest
  - Profit percentage
  - Quick actions (View Details, Withdraw)
- **Transaction History Tab**: Complete history of all deposit and withdrawal transactions

### 💸 Withdraw Funds
Withdraw your deposited assets:
- Select which position to withdraw from
- Flexible withdrawal amounts
- Automatic fee calculations (1% standard fee)
- Net amount display
- Withdrawal summary with fee breakdown

## Smart Contract Integration

This frontend integrates with the YIFY Finance protocol smart contracts. Make sure to:

1. Deploy contracts to Base network
2. Update contract addresses in the configuration
3. Configure RPC endpoints for Base network

## Environment Variables

Create a `.env.local` file:

```env
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_BASE_RPC_URL=https://mainnet.base.org
```

## Development Notes

- Uses mock data for demonstration
- Replace mock data with actual smart contract calls
- Add proper error handling and loading states
- Implement comprehensive testing
- Add analytics and monitoring

## Deployment

The app is configured for deployment on Vercel, Netlify, or any static hosting service.
# frontend
# frontend
# frontend
