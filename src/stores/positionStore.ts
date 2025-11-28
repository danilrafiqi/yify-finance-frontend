import { create } from 'zustand'
import { MockLoanPosition } from '../utils/mockData'

interface PositionState {
  positions: MockLoanPosition[]
  createPosition: (nftId: string, loanAmount: number, collateralValue: number) => void
  advanceWeek: () => void // For simulation
  manualRepay: (positionId: string, amount: number) => void
  removePosition: (positionId: string) => void
}

export const usePositionStore = create<PositionState>((set) => ({
  positions: [],

  createPosition: (nftId, loanAmount, collateralValue) => {
    const newPosition: MockLoanPosition = {
      id: `loan-${Date.now()}`,
      nftId,
      loanAmount,
      remainingDebt: loanAmount,
      collateralValue,
      currentWeek: 0,
      totalWeeks: 65,
      yieldGenerated: 0,
      repaymentProgress: 0,
      status: 'active'
    }
    set((state) => ({ positions: [...state.positions, newPosition] }))
  },

  advanceWeek: () => {
    set((state) => ({
      positions: state.positions.map((pos) => {
        if (pos.status !== 'active') return pos

        // Simulate yield generation (simplified logic)
        // Assume 30% APR on collateral value for simulation
        // Weekly yield = (Collateral * 0.30) / 52
        const weeklyYield = (pos.collateralValue * 0.30) / 52
        
        // Distribution
        const repaymentShare = weeklyYield * 0.75
        
        const newRemainingDebt = Math.max(0, pos.remainingDebt - repaymentShare)
        const newYieldGenerated = pos.yieldGenerated + weeklyYield
        const newCurrentWeek = pos.currentWeek + 1
        
        const newProgress = ((pos.loanAmount - newRemainingDebt) / pos.loanAmount) * 100

        return {
          ...pos,
          remainingDebt: newRemainingDebt,
          yieldGenerated: newYieldGenerated,
          currentWeek: newCurrentWeek,
          repaymentProgress: newProgress,
          status: newRemainingDebt <= 0 ? 'completed' : 'active'
        }
      })
    }))
  },

  manualRepay: (positionId, amount) => {
    set((state) => ({
      positions: state.positions.map((pos) => {
        if (pos.id !== positionId) return pos

        const newRemainingDebt = Math.max(0, pos.remainingDebt - amount)
        const newProgress = ((pos.loanAmount - newRemainingDebt) / pos.loanAmount) * 100

        return {
          ...pos,
          remainingDebt: newRemainingDebt,
          repaymentProgress: newProgress,
          status: newRemainingDebt <= 0 ? 'completed' : 'active'
        }
      })
    }))
  },

  removePosition: (positionId) => {
    set((state) => ({
      positions: state.positions.filter((pos) => pos.id !== positionId)
    }))
  }
}))
