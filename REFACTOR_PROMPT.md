# YIFY Lending Platform Frontend Refactor - UI Focus

## 🎯 Objective
Refactor the entire YIFY lending frontend UI to match the specifications in `Feature.md` and `LENDING_FLOW.md` with **neo-brutalism design**. Focus on UI/UX implementation with mock data only - **NO smart contract integration yet**.

## 🛠️ Tech Stack (Keep Current)
- React 18 + TypeScript
- Zustand for state management (mock data)
- React Hook Form
- React Router
- Tailwind CSS
- Framer Motion for animations
- Lucide React for icons

**NO new Web3 dependencies needed** - use mock wallet connections and simulated data.

## 🎨 Neo-Brutalism Design System

### Color Palette
- **Red**: `#FF0000`
- **Yellow**: `#FFFF00`
- **Cyan**: `#00FFFF`
- **Magenta**: `#FF00FF`
- **Lime**: `#00FF00`
- **Black**: `#000000`
- **White**: `#FFFFFF`

### Design Rules
- **Borders**: 4-8px solid black (`border-[4px] border-black` or `border-[8px] border-black`)
- **Shadows**: Large drop shadows with 8-16px offset (`shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`)
- **Typography**: Bold, angular fonts - use `font-black` or `font-extrabold` with `uppercase` where appropriate
- **Shapes**: Geometric forms with sharp angles - **NO rounded corners** (use `rounded-none`)
- **Layout**: High contrast, bold elements, 90s-inspired raw aesthetic
- **Spacing**: Generous padding (p-6, p-8) with clear separation
- **Buttons**: Large, bold, with thick borders and shadows

### Example Component Style:
```tsx
<div className="bg-yellow-400 border-[6px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
  <h1 className="text-black font-black text-4xl uppercase">YIFY</h1>
</div>
```

## 🏗️ New Application Structure

### 1. Landing Page (`src/pages/LandingPage.tsx`)
**Route**: `/`
- Hero section with YIFY logo (neo-brutalism style)
- Platform statistics cards:
  - Total TVL (mock: $2.5M)
  - Total Loans (mock: 150)
  - Active Users (mock: 89)
- Two prominent CTA buttons: **"BORROW"** and **"LEND"** (large, bold, colored)
- Brief explanation sections with icons
- Network indicators (Optimism/Base/Ethereum badges)
- Footer with links to Help/FAQ

### 2. Borrower Flow Pages

#### **Borrower Dashboard** (`src/pages/borrower/Dashboard.tsx`)
**Route**: `/borrower/dashboard`
- Active loan positions list with:
  - Collateral NFT image/name
  - Loan amount and remaining debt
  - Progress bar showing repayment progress (0-65 weeks)
  - Current week indicator
  - Yield allocation breakdown (75% repayment, 20% lender, 5% protocol)
- Summary cards:
  - Total debt
  - Total collateral value
  - Estimated completion date
- Transaction history table
- Quick actions: View details, Withdraw NFT (when paid)

#### **Collateral Selection** (`src/pages/borrower/CollateralSelection.tsx`)
**Route**: `/borrower/select-collateral`
- Network filter tabs (Optimism/Base/Ethereum)
- NFT gallery grid showing:
  - veAERO NFTs (Base network)
  - veVELO NFTs (Optimism network)
  - NFT RWA (Ethereum network)
- Each NFT card displays:
  - NFT image/placeholder
  - Current price
  - Projected yield % (30% APR for veNFT, varies for RWA)
  - Calculated LTV ratio
  - Max borrow amount
- Selection mechanism (click to select, visual feedback)
- "Continue to Calculator" button

#### **Loan Calculator** (`src/pages/borrower/LoanCalculator.tsx`)
**Route**: `/borrower/calculator`
- Selected NFT display at top
- Interactive LTV calculator:
  - Formula: `MIN(50%, Projection_Yield × 65)`
  - Input: Loan amount slider/input
  - Real-time calculation display
- Repayment simulation:
  - Visual timeline (65 weeks)
  - Weekly yield generation visualization
  - Auto-repayment progress animation
  - Breakdown: 75% repayment, 20% lender, 5% protocol
- Summary section:
  - Max borrowable amount
  - Estimated repayment time
  - Total yield generated
- "Confirm & Borrow" button (large, bold)

### 3. Lender Flow Pages

#### **Lender Dashboard** (`src/pages/lender/Dashboard.tsx`)
**Route**: `/lender/dashboard`
- Summary cards:
  - Total USDC deposited (mock: $50,000)
  - Total yield earned (mock: $2,500)
  - Current APR (mock: 20%)
  - Active positions count
- Yield tracking section:
  - Real-time yield streams from different NFT pools
  - Weekly/monthly yield breakdown
  - Visual charts/graphs
- Auto-reinvest toggle (large switch, neo-brutalism style)
- Withdrawal history table
- "Deposit More" CTA button

#### **Deposit Interface** (`src/pages/lender/Deposit.tsx`)
**Route**: `/lender/deposit`
- USDC balance display
- Deposit form:
  - Amount input (with max button)
  - Approval status (mock: "Approved" or "Need Approval")
  - Gas estimation display (mock: ~$5-10)
- Deposit summary:
  - Amount to deposit
  - Expected yield (20% of NFT yields)
  - Estimated APR
- "Approve Contract" button (if needed)
- "Deposit USDC" button (primary action)

### 4. Common Components (Refactor with Neo-Brutalism)

#### **Header/Navigation** (`src/components/common/Header.tsx`)
- YIFY logo (left)
- Navigation links: Home, Borrower, Lender, Help
- Wallet connection button (right)
- Network switcher dropdown (right)
- Bold borders, no rounded corners

#### **WalletConnection** (`src/components/common/WalletConnection.tsx`)
- Mock wallet connection interface
- Display wallet address (truncated)
- USDC balance display
- Disconnect button
- Neo-brutalism styled cards

#### **NetworkSwitcher** (`src/components/common/NetworkSwitcher.tsx`)
- Dropdown/selector for networks:
  - Optimism (for veVELO)
  - Base (for veAERO)
  - Ethereum (for NFT RWA)
- Visual network badges
- Current network indicator

#### **NotificationSystem** (`src/components/common/NotificationSystem.tsx`)
- Toast notifications using react-hot-toast (styled neo-brutalism)
- Success, error, info, warning variants
- Bold borders and shadows
- Auto-dismiss with manual close option

#### **NFT Card** (`src/components/common/NFTCard.tsx`)
- Reusable NFT card component
- Displays: image, name, price, yield, LTV
- Selection state styling
- Hover effects (bold, no subtle animations)

### 5. Help & FAQ (`src/pages/HelpFAQ.tsx`)
**Route**: `/help`
- Accordion-style FAQ sections
- User guide with step-by-step instructions
- Risk disclosures section
- Contact support form
- All styled with neo-brutalism

## 📊 Mock Data Structure

### NFT Mock Data:
```typescript
interface MockNFT {
  id: string
  name: string
  type: 'veAERO' | 'veVELO' | 'rwa'
  network: 'Base' | 'Optimism' | 'Ethereum'
  price: number
  projectedYield: number // APR %
  imageUrl?: string
  ltv: number // Calculated: MIN(50%, projectedYield * 65)
  maxBorrow: number // price * ltv / 100
}
```

### Loan Position Mock Data:
```typescript
interface MockLoanPosition {
  id: string
  nftId: string
  loanAmount: number
  remainingDebt: number
  collateralValue: number
  currentWeek: number // 0-65
  totalWeeks: 65
  yieldGenerated: number
  repaymentProgress: number // percentage
  status: 'active' | 'completed'
}
```

### Lender Position Mock Data:
```typescript
interface MockLenderPosition {
  id: string
  depositAmount: number
  yieldEarned: number
  apr: number
  autoReinvest: boolean
  depositDate: Date
}
```

## 🗂️ File Structure Changes

### Remove Files:
- ❌ `src/components/PortfolioDashboard.tsx`
- ❌ `src/components/RepayInterface.tsx`
- ❌ `src/components/PositionManagement.tsx`
- ❌ `src/components/LenderMenu.tsx`

### New File Structure:
```
src/
├── pages/
│   ├── LandingPage.tsx
│   ├── HelpFAQ.tsx
│   ├── borrower/
│   │   ├── Dashboard.tsx
│   │   ├── CollateralSelection.tsx
│   │   └── LoanCalculator.tsx
│   └── lender/
│       ├── Dashboard.tsx
│       └── Deposit.tsx
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── WalletConnection.tsx (refactor existing)
│   │   ├── NetworkSwitcher.tsx
│   │   ├── NotificationSystem.tsx
│   │   └── NFTCard.tsx
│   ├── borrower/
│   │   ├── LoanProgressCard.tsx
│   │   ├── RepaymentTimeline.tsx
│   │   └── YieldBreakdown.tsx
│   └── lender/
│       ├── YieldTracker.tsx
│       ├── DepositForm.tsx
│       └── AutoReinvestToggle.tsx
├── stores/
│   ├── mockDataStore.ts (new - centralized mock data)
│   ├── networkStore.ts (new)
│   ├── platformStatsStore.ts (new)
│   ├── borrowerStore.ts (refactor existing)
│   └── lenderStore.ts (new)
├── hooks/
│   ├── useLTVCalculation.ts
│   ├── useRepaymentSimulation.ts
│   └── useMockWallet.ts
└── utils/
    ├── constants.ts
    ├── calculations.ts
    └── mockData.ts
```

## 🔧 State Management Updates

### New Stores:

1. **mockDataStore.ts**: Centralized mock data for NFTs, loans, lender positions
2. **networkStore.ts**: Current network state, network switching logic
3. **platformStatsStore.ts**: TVL, total loans, active users (mock stats)
4. **borrowerStore.ts**: Refactor existing - loan positions, repayment tracking
5. **lenderStore.ts**: Deposits, yield earnings, auto-reinvest settings

### Update Existing Stores:
- **walletStore.ts**: Keep mock wallet functionality, enhance UI state
- **nftStore.ts**: Add network-specific NFT data, yield projections
- **positionStore.ts**: Implement 65-week repayment timeline, auto-repayment simulation
- **transactionStore.ts**: Enhanced with yield distribution tracking

## 📐 Key Calculations to Implement

### LTV Calculation:
```typescript
const calculateLTV = (projectionYield: number): number => {
  // projectionYield is APR percentage (e.g., 30 for 30% APR)
  // Convert to weekly: projectionYield / 52
  // Multiply by 65 weeks
  const weeklyYield = projectionYield / 52
  const totalYield = weeklyYield * 65
  return Math.min(50, totalYield)
}
```

### Max Borrow Amount:
```typescript
const calculateMaxBorrow = (nftPrice: number, ltv: number): number => {
  return (nftPrice * ltv) / 100
}
```

### Repayment Progress:
```typescript
const calculateRepaymentProgress = (
  currentWeek: number,
  totalWeeks: number = 65
): number => {
  return Math.min(100, (currentWeek / totalWeeks) * 100)
}
```

### Yield Distribution:
- **75%** → Borrower debt repayment
- **20%** → Lender earnings (USDC)
- **5%** → Protocol fee

## 🎭 Animation & Interactions

### Framer Motion Usage:
- **Page transitions**: Bold slide-in animations
- **Card hovers**: Lift effect with shadow increase
- **Button clicks**: Press-down effect
- **Progress bars**: Smooth fill animations
- **Number counters**: Count-up animations for stats

### Example Animation:
```tsx
<motion.div
  whileHover={{ y: -4, boxShadow: "16px 16px 0px 0px rgba(0,0,0,1)" }}
  className="border-[6px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
>
```

## 📱 Responsive Design

- **Mobile**: Stack layouts, full-width buttons, larger touch targets
- **Tablet**: 2-column grids where appropriate
- **Desktop**: Full multi-column layouts
- **Consistent**: Neo-brutalism styling across all breakpoints

## 🧹 Code Quality Requirements

1. **TypeScript**: Strict typing, no `any` types
2. **Component Structure**: Clear separation of concerns
3. **Reusability**: Extract common patterns into components
4. **Accessibility**: Proper ARIA labels, keyboard navigation
5. **Performance**: Lazy loading for routes, memoization where needed
6. **Clean Code**: Remove unused imports, dead code, console.logs

## ✅ Implementation Checklist

### Phase 1: Design System
- [ ] Create neo-brutalism Tailwind utility classes
- [ ] Design system documentation
- [ ] Color palette implementation
- [ ] Typography system

### Phase 2: Core Pages
- [ ] Landing Page
- [ ] Borrower Dashboard
- [ ] Lender Dashboard
- [ ] Help & FAQ

### Phase 3: Borrower Flow
- [ ] Collateral Selection
- [ ] Loan Calculator with LTV formula
- [ ] Repayment timeline visualization

### Phase 4: Lender Flow
- [ ] Deposit Interface
- [ ] Yield tracking components
- [ ] Auto-reinvest toggle

### Phase 5: Common Components
- [ ] Header/Navigation
- [ ] Wallet Connection (refactor)
- [ ] Network Switcher
- [ ] Notification System
- [ ] NFT Card component

### Phase 6: State Management
- [ ] Mock data stores
- [ ] Network store
- [ ] Platform stats store
- [ ] Borrower/Lender stores refactor

### Phase 7: Polish
- [ ] Animations
- [ ] Responsive design
- [ ] Error states
- [ ] Loading states
- [ ] Code cleanup

## 🎯 Success Criteria

1. ✅ All pages match Feature.md specifications
2. ✅ All flows match LENDING_FLOW.md documentation
3. ✅ Consistent neo-brutalism design throughout
4. ✅ Mock data works seamlessly
5. ✅ Calculations are accurate (LTV, repayment, yield)
6. ✅ Responsive on all devices
7. ✅ Smooth animations and interactions
8. ✅ Clean, maintainable code structure

---

**Note**: This refactor focuses purely on UI/UX. Smart contract integration will be added later when contracts are ready. All wallet connections and transactions are simulated with mock data.
