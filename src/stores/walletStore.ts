import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Wallet {
  name: string
  address: string
  balance: number
}

interface WalletState {
  isConnected: boolean
  currentWallet: Wallet | null
  connectWallet: (wallet: Wallet) => void
  disconnectWallet: () => void
  updateBalance: (amount: number) => void
}

// Mock wallets with initial balances
const mockWallets: Wallet[] = [
  {
    name: 'MetaMask',
    address: '0x742d35Cc6347d2b5c6b1E8E5a1d6F9e4a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7',
    balance: 15000 // USDC balance
  },
  {
    name: 'Coinbase Wallet',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    balance: 25000
  },
  {
    name: 'WalletConnect',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    balance: 5000
  }
]

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      isConnected: false,
      currentWallet: null,

      connectWallet: (wallet) => {
        const fullWallet = mockWallets.find(w => w.name === wallet.name) || wallet
        set({ isConnected: true, currentWallet: fullWallet })
      },

      disconnectWallet: () => {
        set({ isConnected: false, currentWallet: null })
      },

      updateBalance: (amount) => {
        const currentWallet = get().currentWallet
        if (currentWallet) {
          set({
            currentWallet: {
              ...currentWallet,
              balance: Math.max(0, currentWallet.balance + amount)
            }
          })
        }
      }
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({
        isConnected: state.isConnected,
        currentWallet: state.currentWallet
      })
    }
  )
)

export const getMockWallets = () => mockWallets

// Development helper to reset all stores
export const resetAllStores = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('wallet-storage')
    localStorage.removeItem('nft-storage')
    localStorage.removeItem('position-storage')
    localStorage.removeItem('transaction-storage')
    // Force page reload to reinitialize with fresh data
    window.location.reload()
  }
}
