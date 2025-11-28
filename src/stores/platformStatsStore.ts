import { create } from 'zustand'

interface PlatformStatsState {
  tvl: number
  totalLoans: number
  activeUsers: number
  totalBorrow: number
  availableFund: number
}

export const usePlatformStatsStore = create<PlatformStatsState>(() => ({
  tvl: 2500000, // $2.5M
  totalLoans: 150,
  activeUsers: 89,
  totalBorrow: 1200000, // $1.2M
  availableFund: 1300000 // $1.3M
}))
