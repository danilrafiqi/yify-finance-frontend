import { create } from 'zustand'

export type NetworkType = 'Optimism' | 'Base' | 'Ethereum'

interface NetworkState {
  currentNetwork: NetworkType
  setNetwork: (network: NetworkType) => void
}

export const useNetworkStore = create<NetworkState>((set) => ({
  currentNetwork: 'Base', // Default to Base for veAERO
  setNetwork: (network) => set({ currentNetwork: network }),
}))

