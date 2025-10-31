# 🏦 Lender Dashboard Features

Complete documentation for the YIFY Lender Dashboard - A comprehensive lending interface for users to provide liquidity and earn interest.

## Overview

The Lender Dashboard allows users to:
- Browse available lending pools
- Supply liquidity to earn interest
- Manage their lending positions
- Withdraw funds at any time
- Track transaction history and earnings

## Features

### 1. **Lending Markets** (`/lender/markets`)
**Overview of available lending pools**

#### Components:
- Protocol overview with Total Deposits, Active Lenders, and Average APY
- Market grid showing all available pools

#### Pool Information:
- Asset name and symbol
- Current APY (Annual Percentage Yield)
- Total deposits in pool
- Pool utilization rate with visual bar
- Pool description
- Direct deposit button

#### Supported Assets:
- **USDC**: 8.5% APY
- **USDT**: 8.2% APY
- **DAI**: 7.9% APY
- **AERO**: 12.3% APY

#### Key Features:
- Real-time utilization display (green < 60%, yellow 60-80%, red > 80%)
- Visual utilization bars for quick assessment
- Information section explaining how lending works
- One-click navigation to deposit pool

---

### 2. **Supply Liquidity** (`/lender/deposit`)
**Deposit assets to earn interest**

#### Components:

##### Wallet Summary:
- Available Balance
- Total Deposited
- Interest Earned
- Average APY

##### Deposit Form:
- Pool selection with inline APY display
- Amount input with max button
- Real-time calculations

##### Calculations:
- **Monthly Interest**: (Amount × APY) ÷ 100 ÷ 12
- **1-Year Total**: Amount × (1 + APY/100)
- **Fee**: 0% (no deposit fees)

##### Summary Display:
- Deposit amount
- Current APY
- Estimated monthly interest
- Estimated value after 1 year

#### User Flow:
1. Select asset pool
2. Enter deposit amount
3. Review summary and calculations
4. Confirm deposit
5. Transaction confirmation

#### Features:
- Pool selection toggle (4 options)
- Real-time interest calculations
- Confirmation checkbox for safety
- Automatic wallet balance update
- Transaction history recording

---

### 3. **Lending Positions** (`/lender/positions`)
**Manage lending portfolio and view earnings**

#### Portfolio Summary:
Displays aggregated statistics:
- **Total Deposited**: Sum of all deposits
- **Current Value**: Total value including earned interest
- **Interest Earned**: Total interest accrued
- **Monthly Earnings**: Projected monthly interest

#### Two Tab Views:

##### Tab 1: Active Positions
Shows detailed information for each lending position:

**Per Position Display:**
- Asset icon and name
- Deposit date
- APY rate
- Status badge

**Position Statistics Grid:**
- Deposited amount
- Current value
- Interest earned (in green)
- Monthly interest
- Profit percentage

**Actions:**
- View Details button
- Withdraw button

#### Tab 2: Transaction History
Complete transaction log with:
- Transaction type (Deposit/Withdraw with icons)
- Asset symbol
- Amount (with +/- indicator)
- Date
- Status badge (Confirmed/Pending/Failed)

#### Features:
- Tab switching between positions and history
- Real-time position updates
- Empty state handling for new users
- Color-coded transaction types
- Responsive table layout

---

### 4. **Withdraw Funds** (`/lender/withdraw`)
**Withdraw deposited assets**

#### Position Selection:
Choose which position to withdraw from:
- Visual position cards
- Shows available balance
- Originally deposited amount
- Interest earned

#### Withdrawal Form:

##### Selected Position Info Box (Blue):
- Selected position name
- Available balance
- Originally deposited
- Interest earned

##### Amount Input:
- Number input with asset symbol
- Max button for full withdrawal
- Validation for available balance

##### Fee Calculation:
- **Withdrawal Fee**: 1% of withdrawal amount
- **Net Amount**: Withdrawal Amount - Fee
- Clear breakdown display

##### Withdrawal Options:
- **Standard** (1% fee): 1-3 minutes
- **Priority** (2% fee): 30 seconds
- **Instant** (5% fee): Immediate

#### User Flow:
1. Select position to withdraw from
2. Enter withdrawal amount
3. Review fee and net amount
4. Confirm withdrawal
5. Receive net amount in wallet

#### Features:
- Position selection with visual feedback
- Real-time fee calculations
- Net amount display
- Fee structure information
- Processing time options
- Withdrawal summary

---

## Component Architecture

### File Structure:
```
src/components/
├── LenderMenu.tsx                 # Main router & header
└── lender/
    ├── LendingMarkets.tsx         # Pool browser
    ├── LenderDeposit.tsx          # Supply interface
    ├── LenderPositions.tsx        # Portfolio dashboard
    └── LenderWithdraw.tsx         # Withdrawal interface
```

### Data Flow:
```
LenderMenu (Router)
├── LendingMarkets
│   └── Uses: Mock pool data
├── LenderDeposit
│   └── Uses: useWalletStore, useTransactionStore
├── LenderPositions
│   └── Uses: useTransactionStore, useWalletStore
└── LenderWithdraw
    └── Uses: useWalletStore, useTransactionStore
```

---

## State Management

### Zustand Stores Used:

#### `useWalletStore`
- `balance`: Current wallet balance
- `updateBalance(amount)`: Update balance

#### `useTransactionStore`
- `addTransaction()`: Record transaction
- `getRecentTransactions()`: Fetch transaction history

#### Mock Data:
- Lending pools (4 assets)
- Lender positions (4 positions per user)
- Transaction history

---

## Form Validation

### LenderDeposit:
- Amount required
- Minimum: 1 unit
- Maximum: Available balance
- Confirmation required

### LenderWithdraw:
- Amount required
- Minimum: 1 unit
- Maximum: Available balance
- Confirmation required

---

## UI/UX Features

### Design System:
- **Primary Color**: Green (for lending/positive actions)
- **Secondary Color**: Blue (for information)
- **Warning Color**: Yellow (for caution)
- **Danger Color**: Red (for withdrawal)

### Components:
- Gradient headers for each section
- Card-based layout for positions
- Tab navigation for portfolio
- Summary boxes with color coding
- Status badges for transactions
- Responsive grid layouts

### Accessibility:
- Form labels and descriptions
- Error messages
- Confirmation requirements
- Status indicators
- Information sections

---

## Integration Points

### With Stores:
1. **Wallet Balance**: Automatically updates on deposit/withdraw
2. **Transaction History**: All actions recorded
3. **Position Data**: Currently using mock data

### Future Integrations:
1. Smart contract calls for deposits
2. Real-time interest calculations
3. On-chain transaction tracking
4. Live pool utilization data
5. User-specific position data

---

## Mock Data

### Lending Pools:
```typescript
{
  id: 'usdc-pool',
  symbol: 'USDC',
  apy: 8.5,
  totalDeposits: 1250000,
  utilization: 75
}
```

### Lender Positions:
```typescript
{
  id: 'pos-usdc-1',
  asset: 'USDC',
  depositedAmount: 50000,
  currentValue: 54250,
  apy: 8.5,
  interestEarned: 4250,
  monthlyInterest: 358.33
}
```

---

## Usage

### Access Lender Dashboard:
1. Connect wallet (if not already connected)
2. Navigate to "🏦 Lender" in navigation bar
3. Or navigate to `/lender/markets`

### Routes:
- `/lender/markets` - View available pools
- `/lender/deposit` - Supply liquidity
- `/lender/positions` - Manage positions
- `/lender/withdraw` - Withdraw funds

---

## Future Enhancements

1. **Real Data Integration**
   - Connect to actual smart contracts
   - Real-time interest calculations
   - Live pool data

2. **Advanced Features**
   - Automated lending strategies
   - Yield farming integration
   - Multi-chain support

3. **Analytics**
   - Performance charts
   - ROI calculations
   - Historical data

4. **Risk Management**
   - Risk indicators
   - Pool health monitoring
   - Alert system

---

## API Responses (Mock)

All data is currently mocked. Replace with actual API calls:

```typescript
// Get lending pools
getAvailablePools(): Pool[]

// Get user positions
getUserPositions(): Position[]

// Get transaction history
getTransactionHistory(): Transaction[]

// Submit deposit
submitDeposit(amount: number, pool: string): Transaction

// Submit withdrawal
submitWithdraw(amount: number, position: string): Transaction
```

---

## Support

For issues or questions about the Lender features, refer to:
- Component documentation in JSDoc comments
- DEBUG_GUIDE.md for debugging
- QUICK_START.md for getting started
