export interface MockNFT {
  id: string
  name: string
  type: 'veAERO' | 'veVELO' | 'rwa'
  network: 'Base' | 'Optimism' | 'Ethereum'
  price: number
  projectedYield: number // APR %
  imageUrl: string
  ltv: number // Calculated: MIN(50%, projectedYield * 65)
  maxBorrow: number // price * ltv / 100
}

export interface MockLoanPosition {
  id: string
  nftId: string
  loanAmount: number
  remainingDebt: number
  collateralValue: number
  currentWeek: number // 0-65
  totalWeeks: number
  yieldGenerated: number
  repaymentProgress: number // percentage
  status: 'active' | 'completed'
}

export interface MockLenderPosition {
  id: string
  depositAmount: number
  yieldEarned: number
  apr: number
  depositDate: string
}

export interface MockLenderTransaction {
  id: string
  type: 'deposit' | 'withdraw' | 'yield'
  amount: number
  date: string
  status: 'completed' | 'pending'
}

export const MOCK_NFTS: MockNFT[] = [
  {
    id: 'nft-1',
    name: 'veAERO #1337',
    type: 'veAERO',
    network: 'Base',
    price: 5000,
    projectedYield: 30, // 30% APR
    imageUrl: 'https://placehold.co/400x400/FF0000/FFFFFF/png?text=veAERO',
    ltv: 37.5, // 30/52 * 65 = 37.5
    maxBorrow: 1875
  },
  {
    id: 'nft-2',
    name: 'veVELO #420',
    type: 'veVELO',
    network: 'Optimism',
    price: 3000,
    projectedYield: 25,
    imageUrl: 'https://placehold.co/400x400/00FFFF/000000/png?text=veVELO',
    ltv: 31.25,
    maxBorrow: 937.5
  },
  {
    id: 'nft-3',
    name: 'Real Estate Token #5',
    type: 'rwa',
    network: 'Ethereum',
    price: 10000,
    projectedYield: 15,
    imageUrl: 'https://placehold.co/400x400/FFFF00/000000/png?text=RWA',
    ltv: 18.75,
    maxBorrow: 1875
  }
]
