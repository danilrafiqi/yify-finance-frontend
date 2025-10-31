import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface NFT {
  id: string
  name: string
  lockAmount: number // AERO tokens locked
  expiryDate: string
  currentYield: number // Annual yield percentage
  ltv: number // Loan-to-value ratio
  floorPrice: number // Current floor price in USD
  isDeposited: boolean
  depositedAt?: string
  positionId?: string
}

// Clean initial NFT data with 7 NFTs deposited in pos-1
const initialNFTs: NFT[] = [
  // veAero NFTs (weekly epochs)
  {
    id: 'veaero-1',
    name: 'veAero #1234',
    lockAmount: 2500,
    expiryDate: '2025-12-31',
    currentYield: 28.5,
    ltv: 60,
    floorPrice: 3750,
    isDeposited: false
  },
  {
    id: 'veaero-2',
    name: 'veAero #5678',
    lockAmount: 3750,
    expiryDate: '2025-06-15',
    currentYield: 32.1,
    ltv: 65,
    floorPrice: 5625,
    isDeposited: true,
    depositedAt: '2024-10-24',
    positionId: 'pos-1'
  },
  {
    id: 'veaero-3',
    name: 'veAero #9012',
    lockAmount: 1800,
    expiryDate: '2024-09-22',
    currentYield: 24.7,
    ltv: 55,
    floorPrice: 2700,
    isDeposited: true,
    depositedAt: '2024-10-24',
    positionId: 'pos-1'
  },
  {
    id: 'veaero-4',
    name: 'veAero #3456',
    lockAmount: 4200,
    expiryDate: '2025-11-08',
    currentYield: 35.2,
    ltv: 70,
    floorPrice: 6300,
    isDeposited: true,
    depositedAt: '2024-10-24',
    positionId: 'pos-1'
  },
  {
    id: 'veaero-5',
    name: 'veAero #7890',
    lockAmount: 3100,
    expiryDate: '2024-08-14',
    currentYield: 26.8,
    ltv: 58,
    floorPrice: 4650,
    isDeposited: true,
    depositedAt: '2024-10-24',
    positionId: 'pos-1'
  },
  {
    id: 'veaero-6',
    name: 'veAero #1357',
    lockAmount: 2800,
    expiryDate: '2025-03-29',
    currentYield: 29.4,
    ltv: 62,
    floorPrice: 4200,
    isDeposited: true,
    depositedAt: '2024-10-24',
    positionId: 'pos-1'
  },
  {
    id: 'veaero-7',
    name: 'veAero #2468',
    lockAmount: 3500,
    expiryDate: '2025-01-15',
    currentYield: 30.8,
    ltv: 63,
    floorPrice: 5250,
    isDeposited: true,
    depositedAt: '2024-10-24',
    positionId: 'pos-1'
  },
  {
    id: 'veaero-8',
    name: 'veAero #5791',
    lockAmount: 2900,
    expiryDate: '2024-11-03',
    currentYield: 27.5,
    ltv: 59,
    floorPrice: 4350,
    isDeposited: true,
    depositedAt: '2024-10-24',
    positionId: 'pos-1'
  },

  // RWA NFTs (monthly epochs)
  {
    id: 'pendle-1',
    name: 'vePendle #1',
    lockAmount: 1500,
    expiryDate: '2026-06-15',
    currentYield: 12.3,
    ltv: 55,
    floorPrice: 2250,
    isDeposited: false
  },
  {
    id: 'pendle-2',
    name: 'vePendle #2',
    lockAmount: 2200,
    expiryDate: '2026-08-22',
    currentYield: 13.1,
    ltv: 60,
    floorPrice: 3300,
    isDeposited: false
  },
  {
    id: 'rwa-1',
    name: 'Real Estate RWA #1',
    lockAmount: 5000,
    expiryDate: '2027-03-10',
    currentYield: 8.5,
    ltv: 65,
    floorPrice: 7500,
    isDeposited: false
  },
  {
    id: 'rwa-2',
    name: 'Infrastructure RWA #1',
    lockAmount: 4500,
    expiryDate: '2026-12-05',
    currentYield: 9.2,
    ltv: 68,
    floorPrice: 6750,
    isDeposited: false
  }
]

interface NFTState {
  nfts: NFT[]
  getAvailableNFTs: () => NFT[]
  getDepositedNFTs: () => NFT[]
  getNFTsByPosition: (positionId: string) => NFT[]
  depositNFTs: (nftIds: string[], positionId: string) => void
  withdrawNFTs: (nftIds: string[]) => void
  updateNFTValue: (nftId: string, newValue: number) => void
  simulateYieldGrowth: (nftType?: 'veAero' | 'rwa') => void // Simulate NFT value growth from yield
}

export const useNFTStore = create<NFTState>()(
  persist(
    (set, get) => ({
      nfts: initialNFTs,

      getAvailableNFTs: () => get().nfts.filter(nft => !nft.isDeposited),

      getDepositedNFTs: () => get().nfts.filter(nft => nft.isDeposited),

      getNFTsByPosition: (positionId) =>
        get().nfts.filter(nft => nft.positionId === positionId),

      depositNFTs: (nftIds, positionIds) => {
        const now = new Date().toISOString().split('T')[0]
        // positionIds is now a comma-separated string of position IDs
        const positionIdArray = positionIds.split(',')

        set(state => ({
          nfts: state.nfts.map(nft => {
            const index = nftIds.indexOf(nft.id)
            if (index !== -1) {
              // Each NFT gets its own position ID
              const positionId = positionIdArray[index] || `pos-${nft.id}`
              return { ...nft, isDeposited: true, depositedAt: now, positionId }
            }
            return nft
          })
        }))
      },

      withdrawNFTs: (nftIds) => {
        set(state => ({
          nfts: state.nfts.map(nft =>
            nftIds.includes(nft.id)
              ? { ...nft, isDeposited: false, depositedAt: undefined, positionId: undefined }
              : nft
          )
        }))
      },

      updateNFTValue: (nftId, newValue) => {
        set(state => ({
          nfts: state.nfts.map(nft =>
            nft.id === nftId ? { ...nft, floorPrice: newValue } : nft
          )
        }))
      },

      simulateYieldGrowth: (nftType) => {
        // Simulate epoch-based yield growth for deposited NFTs
        set(state => ({
          nfts: state.nfts.map(nft => {
            if (nft.isDeposited) {
              let yieldMultiplier = 1

              // Different yield schedules based on NFT type
              if (nftType === 'veNFT' && (nft.name.includes('veNFT') || nft.name.includes('veAero'))) {
                // Weekly yield for veAero (7 days worth)
                yieldMultiplier = 7
              } else if (nftType === 'rwa' && !nft.name.includes('veAero')) {
                // Monthly yield for RWA NFTs (30 days worth)
                yieldMultiplier = 30
              } else {
                // Skip if type doesn't match NFT
                return nft
              }

              // Calculate epoch yield growth (annual yield / 365 * days in epoch)
              const epochYield = (nft.floorPrice * nft.currentYield / 100) / 365 * yieldMultiplier
              const newValue = nft.floorPrice + epochYield
              return { ...nft, floorPrice: Math.round(newValue * 100) / 100 }
            }
            return nft
          })
        }))
      }
    }),
    {
      name: 'nft-storage',
      partialize: (state) => ({ nfts: state.nfts })
    }
  )
)