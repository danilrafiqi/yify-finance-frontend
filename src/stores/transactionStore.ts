import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TransactionType =
  | 'deposit'
  | 'withdraw'
  | 'borrow'
  | 'repay'
  | 'yield_earned'
  | 'position_closed'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  token: string // 'USDC', 'AERO', etc.
  positionId?: string
  nftIds?: string[]
  timestamp: string
  hash: string // Mock transaction hash
  status: 'pending' | 'confirmed' | 'failed'
  gasUsed?: number
  description: string
}

interface TransactionState {
  transactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp' | 'hash'>) => void
  updateTransactionStatus: (id: string, status: Transaction['status']) => void
  getTransactionsByPosition: (positionId: string) => Transaction[]
  getRecentTransactions: (limit?: number) => Transaction[]
  getTotalVolume: () => { borrowed: number; repaid: number; yield: number }
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (transactionData) => {
        const transaction: Transaction = {
          id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          ...transactionData
        }

        set(state => ({
          transactions: [transaction, ...state.transactions]
        }))
      },

      updateTransactionStatus: (id, status) => {
        set(state => ({
          transactions: state.transactions.map(tx =>
            tx.id === id ? { ...tx, status } : tx
          )
        }))
      },

      getTransactionsByPosition: (positionId) => {
        return get().transactions.filter(tx => tx.positionId === positionId)
      },

      getRecentTransactions: (limit = 10) => {
        return get().transactions.slice(0, limit)
      },

      getTotalVolume: () => {
        const txs = get().transactions
        return txs.reduce(
          (acc, tx) => {
            switch (tx.type) {
              case 'borrow':
                acc.borrowed += tx.amount
                break
              case 'repay':
                acc.repaid += tx.amount
                break
              case 'yield_earned':
                acc.yield += tx.amount
                break
            }
            return acc
          },
          { borrowed: 0, repaid: 0, yield: 0 }
        )
      }
    }),
    {
      name: 'transaction-storage',
      partialize: (state) => ({ transactions: state.transactions })
    }
  )
)
