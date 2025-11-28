import { create } from 'zustand'
import { MOCK_NFTS, MockNFT } from '../utils/mockData'
import { NetworkType } from './networkStore'

interface NFTState {
  nfts: MockNFT[]
  getNFTsByNetwork: (network: NetworkType) => MockNFT[]
  getNFTById: (id: string) => MockNFT | undefined
}

export const useNFTStore = create<NFTState>((_set, get) => ({
  nfts: MOCK_NFTS,
  
  getNFTsByNetwork: (network: NetworkType) => {
    return get().nfts.filter(nft => nft.network === network)
  },

  getNFTById: (id: string) => {
    return get().nfts.find(nft => nft.id === id)
  }
}))
