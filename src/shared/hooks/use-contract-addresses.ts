// shared/hooks/use-contract-addresses.ts
import { useMemo } from 'react'
import { useChainId } from 'wagmi'
import { CONTRACT_ADDRESSES, LISK_SEPOLIA_CHAIN_ID } from '../../constants/contracts'

/**
 * Hook untuk mendapatkan contract addresses berdasarkan chain ID
 * Fallback ke LISK_SEPOLIA jika chain ID tidak ditemukan
 */
export function useContractAddresses() {
  const chainId = useChainId()
  
  const addresses = useMemo(() => {
    return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] 
      || CONTRACT_ADDRESSES[LISK_SEPOLIA_CHAIN_ID]
  }, [chainId])
  
  return addresses
}

