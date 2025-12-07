import { create } from 'zustand'

interface PlatformStatsState {
  tvl: number
  totalLoans: number
  activeUsers: number
  totalBorrow: number
  availableFund: number
  setPlatformStats: (stats: Partial<Omit<PlatformStatsState, 'setPlatformStats'>>) => void
}

export const usePlatformStatsStore = create<PlatformStatsState>((set) => ({
  tvl: 0,
  totalLoans: 0,
  activeUsers: 0,
  totalBorrow: 0,
  availableFund: 0,
  setPlatformStats: (stats) => set((state) => ({ ...state, ...stats }))
}))
