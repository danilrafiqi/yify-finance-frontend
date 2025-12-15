// shared/types/index.ts
// Shared types used across all modules

// NFT Types for on-chain data
export interface NFT {
    id: string
    name: string
    imageUrl: string
    network: string
    price: number
    projectedYield: number
    ltv: number
    maxBorrow: number
    type: string
    isMock?: boolean
}

// Lender Position Types (legacy, consider using modules/lend/models/position.ts instead)
export interface LenderPosition {
    id: string
    depositAmount: number
    yieldEarned: number
    apr: number
    depositDate: string
}

export interface LenderTransaction {
    id: string
    type: 'deposit' | 'withdraw' | 'yield'
    amount: number
    date: string
    status: 'completed' | 'pending'
}

