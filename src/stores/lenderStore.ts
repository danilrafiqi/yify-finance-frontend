import { create } from 'zustand'
import { MockLenderPosition } from '../utils/mockData'

interface LenderState {
  totalDeposited: number
  totalYieldEarned: number
  positions: MockLenderPosition[]
  deposit: (amount: number) => void
  toggleAutoReinvest: (id: string) => void
}

export const useLenderStore = create<LenderState>((set) => ({
  totalDeposited: 50000,
  totalYieldEarned: 2500,
  positions: [
    {
      id: 'lend-1',
      depositAmount: 50000,
      yieldEarned: 2500,
      apr: 20,
      autoReinvest: true,
      depositDate: new Date().toISOString()
    }
  ],

  deposit: (amount) => {
    set((state) => ({
      totalDeposited: state.totalDeposited + amount,
      positions: [
        ...state.positions,
        {
          id: `lend-${Date.now()}`,
          depositAmount: amount,
          yieldEarned: 0,
          apr: 20,
          autoReinvest: true,
          depositDate: new Date().toISOString()
        }
      ]
    }))
  },

  toggleAutoReinvest: (id) => {
    set((state) => ({
      positions: state.positions.map(p => 
        p.id === id ? { ...p, autoReinvest: !p.autoReinvest } : p
      )
    }))
  }
}))

