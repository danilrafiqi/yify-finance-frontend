import { create } from 'zustand'

interface PlatformStatsState {
  tvl: number
  totalLoans: number
  activeUsers: number
}

export const usePlatformStatsStore = create<PlatformStatsState>(() => ({
  tvl: 2500000, // $2.5M
  totalLoans: 150,
  activeUsers: 89
}))

