import { create } from 'zustand'
import { MockLenderPosition, MockLenderTransaction } from '../utils/mockData'

interface LenderState {
  totalDeposited: number
  totalYieldEarned: number
  currentBalance: number
  positions: MockLenderPosition[]
  history: MockLenderTransaction[]
  deposit: (amount: number) => void
  withdraw: (amount: number) => void
}

export const useLenderStore = create<LenderState>((set) => ({
  totalDeposited: 50000,
  totalYieldEarned: 2500,
  currentBalance: 52500, // totalDeposited + totalYieldEarned
  positions: [
    {
      id: 'lend-1',
      depositAmount: 50000,
      yieldEarned: 2500,
      apr: 20,
      depositDate: new Date('2024-01-15').toISOString()
    }
  ],
  history: [
    {
      id: 'tx-1',
      type: 'deposit',
      amount: 50000,
      date: new Date('2024-01-15').toISOString(),
      status: 'completed'
    },
    {
      id: 'tx-2',
      type: 'yield',
      amount: 2500,
      date: new Date('2024-02-15').toISOString(),
      status: 'completed'
    }
  ],

  deposit: (amount) => {
    set((state) => {
      const newPos: MockLenderPosition = {
        id: `lend-${Date.now()}`,
        depositAmount: amount,
        yieldEarned: 0,
        apr: 20,
        depositDate: new Date().toISOString()
      }
      
      const newTx: MockLenderTransaction = {
        id: `tx-${Date.now()}`,
        type: 'deposit',
        amount: amount,
        date: new Date().toISOString(),
        status: 'completed'
      }

      return {
        totalDeposited: state.totalDeposited + amount,
        currentBalance: state.currentBalance + amount,
        positions: [...state.positions, newPos],
        history: [newTx, ...state.history]
      }
    })
  },
  
  withdraw: (amount) => {
    set((state) => {
        const newTx: MockLenderTransaction = {
            id: `tx-${Date.now()}`,
            type: 'withdraw',
            amount: amount,
            date: new Date().toISOString(),
            status: 'completed'
        }
        return {
            currentBalance: state.currentBalance - amount,
            history: [newTx, ...state.history]
        }
    })
  }
}))
