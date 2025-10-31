import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Position {
  id: string
  collateralNFTs: string[] // Multiple NFT IDs (Aave-style multi-asset collateral)
  totalCollateralValue: number
  borrowedAmount: number
  originationFee: number // 0.5% of borrowed amount
  createdAt: string
  lastUpdated: string
  status: 'active' | 'closed'
  autoRepaymentProgress: number // Percentage of debt paid by yield
  yieldEarned: number
  yieldShared: number // 20% of yield that goes to lenders/protocol
}

// Initial positions - each NFT gets its own position (isolated)
const initialPositions: Position[] = [
  {
    id: 'pos-veaero-2',
    collateralNFTs: ['veaero-2'], // Only this NFT
    totalCollateralValue: 5625, // Value of this NFT only
    borrowedAmount: 0, // No individual borrowing
    originationFee: 0,
    createdAt: '2024-10-24',
    lastUpdated: '2024-10-24',
    status: 'active',
    autoRepaymentProgress: 0,
    yieldEarned: 0,
    yieldShared: 0
  },
  {
    id: 'pos-veaero-3',
    collateralNFTs: ['veaero-3'],
    totalCollateralValue: 2700,
    borrowedAmount: 0,
    originationFee: 0,
    createdAt: '2024-10-24',
    lastUpdated: '2024-10-24',
    status: 'active',
    autoRepaymentProgress: 0,
    yieldEarned: 0,
    yieldShared: 0
  },
  {
    id: 'pos-veaero-4',
    collateralNFTs: ['veaero-4'],
    totalCollateralValue: 6300,
    borrowedAmount: 0,
    originationFee: 0,
    createdAt: '2024-10-24',
    lastUpdated: '2024-10-24',
    status: 'active',
    autoRepaymentProgress: 0,
    yieldEarned: 0,
    yieldShared: 0
  },
  {
    id: 'pos-veaero-5',
    collateralNFTs: ['veaero-5'],
    totalCollateralValue: 4650,
    borrowedAmount: 0,
    originationFee: 0,
    createdAt: '2024-10-24',
    lastUpdated: '2024-10-24',
    status: 'active',
    autoRepaymentProgress: 0,
    yieldEarned: 0,
    yieldShared: 0
  },
  {
    id: 'pos-veaero-6',
    collateralNFTs: ['veaero-6'],
    totalCollateralValue: 4200,
    borrowedAmount: 0,
    originationFee: 0,
    createdAt: '2024-10-24',
    lastUpdated: '2024-10-24',
    status: 'active',
    autoRepaymentProgress: 0,
    yieldEarned: 0,
    yieldShared: 0
  },
  {
    id: 'pos-veaero-7',
    collateralNFTs: ['veaero-7'],
    totalCollateralValue: 5250,
    borrowedAmount: 0,
    originationFee: 0,
    createdAt: '2024-10-24',
    lastUpdated: '2024-10-24',
    status: 'active',
    autoRepaymentProgress: 0,
    yieldEarned: 0,
    yieldShared: 0
  },
  {
    id: 'pos-veaero-8',
    collateralNFTs: ['veaero-8'],
    totalCollateralValue: 4350,
    borrowedAmount: 0,
    originationFee: 0,
    createdAt: '2024-10-24',
    lastUpdated: '2024-10-24',
    status: 'active',
    autoRepaymentProgress: 0,
    yieldEarned: 0,
    yieldShared: 0
  }
]

interface PositionState {
  positions: Position[]
  getActivePositions: () => Position[]
  getPositionById: (id: string) => Position | undefined
  getActiveBorrowPosition: () => Position | undefined // Get the active borrow position (shared collateral pool)
  borrowAdditional: (additionalAmount: number) => string // Borrow additional amount against existing borrow position or create new one
  createIsolatedPosition: (nftId: string) => string // Creates isolated position per NFT
  createBorrowPosition: (borrowedAmount: number) => string // Creates borrow position against all active collateral
  getTotalCollateralValue: () => number // Total value of all active positions
  getWeightedLTV: () => number // Weighted LTV across all positions
  getMaxBorrowAmount: () => number // Max borrow based on all collateral
  updatePositionBorrow: (positionId: string, additionalAmount: number) => void
  repayPosition: (positionId: string, repayAmount: number) => void
  closePosition: (positionId: string) => void
  updateYieldEarnings: (positionId: string, yieldAmount: number) => void
  simulateAutoRepayment: (nftType?: 'veAero' | 'rwa') => void
}

export const usePositionStore = create<PositionState>()(
  persist(
    (set, get) => ({
      positions: initialPositions,

      getActivePositions: () => get().positions.filter(pos => pos.status === 'active'),

      getPositionById: (id) => get().positions.find(pos => pos.id === id),

      getActiveBorrowPosition: () => get().positions.find(pos => pos.id.startsWith('borrow-') && pos.status === 'active'),

      borrowAdditional: (additionalAmount) => {
        const existingBorrowPosition = get().getActiveBorrowPosition()

        if (existingBorrowPosition) {
          // Update existing borrow position
          get().updatePositionBorrow(existingBorrowPosition.id, additionalAmount)
          return existingBorrowPosition.id
        } else {
          // Create new borrow position
          return get().createBorrowPosition(additionalAmount)
        }
      },

      // Creates isolated position for each NFT deposit
      createIsolatedPosition: (nftId) => {
        const positionId = `pos-${nftId}`
        const now = new Date().toISOString()

        const newPosition: Position = {
          id: positionId,
          collateralNFTs: [nftId], // Only this NFT
          totalCollateralValue: 0, // Will be calculated from NFT store
          borrowedAmount: 0, // No individual borrowing
          originationFee: 0,
          createdAt: now,
          lastUpdated: now,
          status: 'active',
          autoRepaymentProgress: 0,
          yieldEarned: 0,
          yieldShared: 0
        }

        set(state => ({
          positions: [...state.positions, newPosition]
        }))

        return positionId
      },

      // Creates borrow position against all active collateral (all deposited NFTs)
      createBorrowPosition: (borrowedAmount) => {
        const positionId = `borrow-${Date.now()}`
        const originationFee = borrowedAmount * 0.005 // 0.5%
        const now = new Date().toISOString()

        // Get all active collateral positions (all deposited NFTs)
        const activePositions = get().positions.filter(pos => pos.status === 'active')
        const allCollateralNFTs = activePositions.flatMap(pos => pos.collateralNFTs)

        const newPosition: Position = {
          id: positionId,
          collateralNFTs: allCollateralNFTs, // All active NFTs as collateral
          totalCollateralValue: get().getTotalCollateralValue(),
          borrowedAmount,
          originationFee,
          createdAt: now,
          lastUpdated: now,
          status: 'active',
          autoRepaymentProgress: 0,
          yieldEarned: 0,
          yieldShared: 0
        }

        set(state => ({
          positions: [...state.positions, newPosition]
        }))

        return positionId
      },

      // Get total collateral value from all active positions
      getTotalCollateralValue: () => {
        const activePositions = get().positions.filter(pos => pos.status === 'active')
        return activePositions.reduce((sum, pos) => sum + pos.totalCollateralValue, 0)
      },

      // Get weighted LTV across all active positions
      getWeightedLTV: () => {
        const activePositions = get().positions.filter(pos => pos.status === 'active')
        if (activePositions.length === 0) return 0

        const totalValue = activePositions.reduce((sum, pos) => sum + pos.totalCollateralValue, 0)
        const totalWeightedLTVValue = activePositions.reduce((sum, pos) => {
          // For isolated positions, each has 1 NFT, so LTV comes from that NFT
          const nftId = pos.collateralNFTs[0]
          // Get NFT data from nftStore (we need to access it)
          // For now, use a simplified calculation - in real app this would be more sophisticated
          // Assume LTV between 55-70% based on NFT type
          let nftLTV = 60 // Default
          if (nftId.includes('veaero-4') || nftId.includes('veaero-6')) nftLTV = 70
          else if (nftId.includes('veaero-3') || nftId.includes('veaero-5')) nftLTV = 55
          else if (nftId.includes('veaero-2')) nftLTV = 65
          else if (nftId.includes('veaero-7')) nftLTV = 63
          else if (nftId.includes('veaero-8')) nftLTV = 59

          return sum + (pos.totalCollateralValue * nftLTV / 100)
        }, 0)

        return totalValue > 0 ? (totalWeightedLTVValue / totalValue) * 100 : 0
      },

      // Get max borrow amount based on all active collateral
      getMaxBorrowAmount: () => {
        const totalCollateralValue = get().getTotalCollateralValue()
        const weightedLTV = get().getWeightedLTV()
        return totalCollateralValue * (weightedLTV / 100)
      },

      updatePositionBorrow: (positionId, additionalAmount) => {
        const now = new Date().toISOString()
        set(state => ({
          positions: state.positions.map(pos =>
            pos.id === positionId
              ? {
                  ...pos,
                  borrowedAmount: pos.borrowedAmount + additionalAmount,
                  originationFee: pos.originationFee + (additionalAmount * 0.005),
                  lastUpdated: now
                }
              : pos
          )
        }))
      },

      repayPosition: (positionId, repayAmount) => {
        const now = new Date().toISOString()
        set(state => ({
          positions: state.positions.map(pos => {
            if (pos.id === positionId) {
              const newBorrowedAmount = Math.max(0, pos.borrowedAmount - repayAmount)
              const repaymentProgress = pos.borrowedAmount > 0
                ? Math.min(100, ((pos.borrowedAmount - newBorrowedAmount) / pos.borrowedAmount) * 100)
                : 0

              return {
                ...pos,
                borrowedAmount: newBorrowedAmount,
                autoRepaymentProgress: repaymentProgress,
                lastUpdated: now,
                status: newBorrowedAmount === 0 ? 'closed' : 'active'
              }
            }
            return pos
          })
        }))
      },

      closePosition: (positionId) => {
        const now = new Date().toISOString()
        set(state => ({
          positions: state.positions.map(pos =>
            pos.id === positionId
              ? { ...pos, status: 'closed', lastUpdated: now }
              : pos
          )
        }))
      },

      updateYieldEarnings: (positionId, yieldAmount) => {
        const now = new Date().toISOString()
        set(state => ({
          positions: state.positions.map(pos =>
            pos.id === positionId
              ? {
                  ...pos,
                  yieldEarned: pos.yieldEarned + yieldAmount,
                  yieldShared: pos.yieldShared + (yieldAmount * 0.2), // 20% shared
                  lastUpdated: now
                }
              : pos
          )
        }))
      },

      simulateAutoRepayment: (nftType) => {
        // Simulate epoch-based auto-repayment from yield
        const now = new Date().toISOString()
        set(state => ({
          positions: state.positions.map(pos => {
            if (pos.borrowedAmount > 0 && pos.yieldEarned > 0) {
              // Check if position contains matching NFT type
              const hasMatchingNFTs = pos.collateralNFTs.some(nftName => {
                if (nftType === 'veAero') return nftName.includes('veNFT') || nftName.includes('veAero')
                if (nftType === 'rwa') return !nftName.includes('veAero')
                return false
              })

              if (!hasMatchingNFTs) return pos

              // Auto-repay 75% of epoch yield towards debt
              const epochYieldShare = pos.yieldEarned * 0.75 // 75% goes to repayment
              const autoRepayAmount = Math.min(pos.borrowedAmount, epochYieldShare)

              const newBorrowedAmount = pos.borrowedAmount - autoRepayAmount
              const newProgress = pos.borrowedAmount > 0
                ? Math.min(100, ((pos.borrowedAmount - newBorrowedAmount) / pos.borrowedAmount) * 100)
                : pos.autoRepaymentProgress

              return {
                ...pos,
                borrowedAmount: newBorrowedAmount,
                autoRepaymentProgress: newProgress,
                lastUpdated: now
              }
            }
            return pos
          })
        }))
      }
    }),
    {
      name: 'position-storage',
      partialize: (state) => ({ positions: state.positions })
    }
  )
)
