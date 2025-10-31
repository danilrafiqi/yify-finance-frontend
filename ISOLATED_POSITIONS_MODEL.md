# 🏗️ **ISOLATED POSITIONS MODEL**

## **NEW ARCHITECTURE: Isolated Positions + Unified Borrowing**

### **What Changed?**

**OLD MODEL (Multi-Asset Positions):**
```
1 Position = Multiple NFTs as collateral
Example: Position #pos-1 contains veAero #5678, #9012, #3456, #7890, #1357, #2468, #5791
```

**NEW MODEL (Isolated Positions):**
```
Each NFT = 1 Isolated Position
Borrowing = Unified collateral from ALL positions
```

---

## **ARCHITECTURE OVERVIEW**

```
┌─────────────────────────────────────────────────────┐
│                  USER'S PORTFOLIO                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  NFT #1 → Isolated Position #pos-veaero-2          │
│  NFT #2 → Isolated Position #pos-veaero-3          │
│  NFT #3 → Isolated Position #pos-veaero-4          │
│  ...                                               │
│                                                     │
│  When BORROW:                                       │
│  ├─ All Isolated Positions → Collateral Pool       │
│  └─ Create Borrow Position #borrow-{timestamp}     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## **POSITION TYPES**

### **1. Isolated Positions (`pos-*`)**
```typescript
{
  id: 'pos-veaero-2',
  collateralNFTs: ['veaero-2'],        // Only 1 NFT
  totalCollateralValue: 5625,          // Value of this NFT only
  borrowedAmount: 0,                   // No individual borrowing
  status: 'active',
  yieldEarned: 0,                      // Tracks individual yield
  yieldShared: 0
}
```

**Purpose:** Hold individual NFTs as collateral-ready positions
**Borrowing:** Cannot borrow directly from isolated positions
**Withdrawal:** Close position → NFT returned to wallet

### **2. Borrow Positions (`borrow-*`)**
```typescript
{
  id: 'borrow-1234567890',
  collateralNFTs: ['veaero-2', 'veaero-3', 'veaero-4', ...], // ALL active NFTs
  totalCollateralValue: 33075,         // Sum of all NFT values
  borrowedAmount: 25000,               // Borrowed amount
  status: 'active',
  originationFee: 125,                 // 0.5% fee
  yieldEarned: 0,
  yieldShared: 0
}
```

**Purpose:** Hold borrow debt against unified collateral
**Collateral:** All NFTs from active isolated positions
**Repayment:** Repay debt → Close borrow position

---

## **USER FLOW**

### **Deposit NFTs (Create Isolated Positions)**
```
User selects: veAero #5678, #9012, #3456
            ↓
Create 3 Isolated Positions:
├─ pos-veaero-2 (veAero #5678) → $5,625
├─ pos-veaero-3 (veAero #9012) → $2,700
└─ pos-veaero-4 (veAero #3456) → $6,300
            ↓
NFTs marked as deposited
Isolated positions active
```

### **Borrow USDC (Create Borrow Position)**
```
User has 7 isolated positions active
            ↓
Borrow $25,000 USDC
            ↓
Create Borrow Position:
├─ ID: borrow-{timestamp}
├─ Collateral: All 7 NFTs ($33,075 total)
├─ Borrowed: $25,000
├─ Weighted LTV: 75.6%
└─ Origination Fee: $125 (0.5%)
```

### **Withdraw Individual NFT**
```
User wants to withdraw veAero #5678
            ↓
Close Isolated Position: pos-veaero-2
            ↓
NFT returned to wallet
Borrow Position collateral updated (6 NFTs remaining)
Weighted LTV recalculated
```

### **Repay Debt**
```
User repays $25,000 + $125 fee
            ↓
Close Borrow Position
            ↓
All isolated positions remain active
NFTs still deposited as collateral
```

---

## **DASHBOARD DISPLAY**

### **Portfolio View**
```
Your Positions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Position ID    | Collateral    | Value    | Borrowed | LTV  | Actions
───────────────┼───────────────┼──────────┼──────────┼──────┼────────
pos-veaero-2   | veAero #5678 | $5,625   | $0       | 65%  | Withdraw NFT
pos-veaero-3   | veAero #9012 | $2,700   | $0       | 55%  | Withdraw NFT
pos-veaero-4   | veAero #3456 | $6,300   | $0       | 70%  | Withdraw NFT
...            | ...          | ...      | ...      | ...  | ...
borrow-123...  | 7 NFTs       | $33,075  | $25,000  | -    | Repay | Close
```

### **Borrow Interface**
```
Your Collateral Pool
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Deposited NFTs: 7
├─ veAero #5678 ($5,625)
├─ veAero #9012 ($2,700)
├─ veAero #3456 ($6,300)
├─ veAero #7890 ($4,650)
├─ veAero #1357 ($4,200)
├─ veAero #2468 ($5,250)
└─ veAero #5791 ($4,350)

Total Collateral Value: $33,075
Weighted LTV: 75.6%
Max Borrow: $25,005
Available: $5

Borrow Amount: [_____] USDC
Origination Fee: 0.5%
You Receive: $24,875
```

---

## **ADVANTAGES OF THIS MODEL**

### **✅ Flexibility**
- Deposit/withdraw individual NFTs without affecting borrowing
- Mix different NFT types in collateral pool
- Scale collateral by adding more NFTs

### **✅ Risk Isolation**
- Each NFT has its own isolated position
- Individual NFT withdrawal doesn't affect other collateral
- Clear separation between collateral and debt

### **✅ Unified Borrowing**
- Borrow against entire portfolio
- Weighted LTV across all assets
- Better capital efficiency

### **✅ Clear Accounting**
- Each position has clear purpose
- Easy to track individual NFT performance
- Transparent collateral management

---

## **TECHNICAL IMPLEMENTATION**

### **Position Creation**
```typescript
// Deposit creates isolated positions
createIsolatedPosition('veaero-2') → 'pos-veaero-2'

// Borrow creates unified position
createBorrowPosition(25000) → 'borrow-1234567890'
  collateralNFTs: ['veaero-2', 'veaero-3', ...] // All active
```

### **Data Relationships**
```
NFT Store:     nft.positionId → Position.id
Position Store: position.collateralNFTs → NFT IDs
Borrow Position: uses ALL active isolated positions as collateral
```

### **Yield Calculation**
```typescript
// Each isolated position tracks its own yield
pos-veaero-2.yieldEarned += epochYield

// Borrow positions don't earn yield directly
// Yield from isolated positions auto-repays borrow debt
```

---

## **COMPARISON WITH AAVE-STYLE**

| Aspect | Aave-Style (Old) | Isolated (New) |
|--------|------------------|----------------|
| **Positions** | 1 position = multiple NFTs | Multiple positions = 1 NFT each |
| **Borrowing** | Borrow from single position | Borrow from unified collateral pool |
| **Withdrawal** | Complex collateral management | Simple individual NFT withdrawal |
| **Risk** | Portfolio-level risk | Individual NFT risk isolation |
| **Scaling** | Add to existing position | Create new isolated positions |
| **UX** | Single position to manage | Multiple positions but clear purpose |

---

## **MIGRATION FROM AAVE-STYLE**

### **What Changed in Code**
1. **positionStore.ts**: Added `createIsolatedPosition()` and `createBorrowPosition()`
2. **BorrowInterface**: Uses all deposited NFTs as collateral
3. **DepositInterface**: Creates isolated positions per NFT
4. **PortfolioDashboard**: Shows both isolated and borrow positions
5. **NFT Gallery**: Shows deposit status clearly

### **Data Migration**
```typescript
// OLD: 1 position with 7 NFTs
pos-1: { collateralNFTs: ['nft2', 'nft3', 'nft4', 'nft5', 'nft6', 'nft7', 'nft8'] }

// NEW: 7 isolated positions + 1 borrow position
pos-veaero-2: { collateralNFTs: ['veaero-2'] }
pos-veaero-3: { collateralNFTs: ['veaero-3'] }
...
borrow-123: { collateralNFTs: ['veaero-2', 'veaero-3', ...] } // All 7
```

---

## **TESTING SCENARIOS**

### **Scenario 1: Deposit & Borrow**
1. Deposit 3 NFTs → Creates 3 isolated positions
2. Borrow $10,000 → Creates 1 borrow position with all 3 NFTs as collateral
3. Result: 3 isolated + 1 borrow = 4 total positions

### **Scenario 2: Withdraw Individual NFT**
1. Have borrow position with 7 NFTs as collateral
2. Withdraw 1 NFT → Closes 1 isolated position
3. Borrow position updates collateral (6 NFTs remaining)
4. LTV recalculates based on remaining collateral

### **Scenario 3: Repay Debt**
1. Have active borrow position
2. Repay full amount → Closes borrow position
3. All isolated positions remain active
4. Can borrow again anytime

---

## **BENEFITS FOR USERS**

### **For NFT Holders**
- **Individual Control**: Deposit/withdraw each NFT independently
- **Risk Management**: Each NFT's risk is isolated
- **Flexibility**: Mix different strategies per NFT

### **For Borrowers**
- **Unified Borrowing**: Borrow against entire portfolio
- **Better Rates**: Weighted LTV optimizes borrowing capacity
- **Auto-Repayment**: NFT yields automatically reduce debt

### **For Protocol**
- **Clear Accounting**: Each position has specific purpose
- **Risk Transparency**: Isolated positions show individual risk
- **Scalability**: Easy to add new collateral types

---

**This model provides the best of both worlds: individual NFT control with unified borrowing power! 🚀**
