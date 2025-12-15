// modules/borrow/viewmodels/collateral-selection.viewmodel.ts
import { useState, useEffect, useMemo } from 'react'
import { useAccount, useChainId, useSwitchChain, useReadContracts, useReadContract } from 'wagmi'
import { useContractAddresses } from '../../../shared/hooks/use-contract-addresses'
import { CONTRACT_ADDRESSES, LISK_SEPOLIA_CHAIN_ID, VENFT_ABI, RWANFT_ABI } from '../../../constants/contracts'
import { LENS_ABI } from '../../../constants/contracts'

export interface WalletNFT {
  tokenId: string
  contract: string
  name: string
  uniqueKey: string
}

export function useCollateralSelectionViewModel() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const addresses = useContractAddresses()
  const contractAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES[LISK_SEPOLIA_CHAIN_ID]

  const [selectedNFT, setSelectedNFT] = useState<WalletNFT | null>(null)
  const [walletNFTs, setWalletNFTs] = useState<WalletNFT[]>([])

  // Fetch Total Supply for veNFT
  const { data: veNFTTotalSupply } = useReadContract({
    address: contractAddresses.veNFT as `0x${string}`,
    abi: VENFT_ABI,
    functionName: 'totalSupply',
    query: { refetchInterval: 5000 }
  })

  // Dynamic Scanning based on Total Supply for veNFT
  const veNFTTokenIdsToCheck = useMemo(() => {
    if (!veNFTTotalSupply) return []
    const limit = Number(veNFTTotalSupply)
    const safeLimit = Math.max(limit, 50)
    return Array.from({ length: safeLimit }, (_, i) => i)
  }, [veNFTTotalSupply])

  // For RWA NFT, scan more tokens since they can be minted dynamically
  const rwaNFTTokenIdsToCheck = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => i)
  }, [])

  // Check ownership for veNFT tokens
  const veNFTOwnershipChecks = useReadContracts({
    contracts: veNFTTokenIdsToCheck.map(tokenId => ({
      address: contractAddresses.veNFT as `0x${string}`,
      abi: VENFT_ABI,
      functionName: 'ownerOf',
      args: [BigInt(tokenId)]
    })),
    query: { enabled: !!address && veNFTTokenIdsToCheck.length > 0, refetchInterval: 2000 }
  })

  // Check ownership for rwaNFT tokens
  const rwaNFTOwnershipChecks = useReadContracts({
    contracts: rwaNFTTokenIdsToCheck.map(tokenId => ({
      address: contractAddresses.rwaNFT as `0x${string}`,
      abi: RWANFT_ABI,
      functionName: 'ownerOf',
      args: [BigInt(tokenId)]
    })),
    query: { enabled: !!address && rwaNFTTokenIdsToCheck.length > 0, refetchInterval: 2000 }
  })

  // Get user loans to filter out deposited NFTs
  const { data: userLoans } = useReadContract({
    address: contractAddresses.lens as `0x${string}`,
    abi: LENS_ABI,
    functionName: 'getUserLoans',
    args: [contractAddresses.loanManager, address!],
    query: { enabled: !!address && !!contractAddresses.loanManager }
  })

  // Extract token IDs from ACTIVE Loans only
  const depositedTokenIds = useMemo(() => {
    return userLoans ? userLoans.filter((loan: any) => loan.isActive).map((loan: any) => loan.tokenId.toString()) : []
  }, [userLoans])

  // Combine wallet NFTs with deposited NFTs
  useEffect(() => {
    if ((veNFTOwnershipChecks.data || rwaNFTOwnershipChecks.data) && address) {
      const ownedNFTs: WalletNFT[] = []

      // Add veNFTs from wallet (ownerOf check)
      if (veNFTOwnershipChecks.data) {
        veNFTOwnershipChecks.data.forEach((result, index) => {
          if (result.status === 'success' && result.result) {
            const owner = result.result as string
            if (owner.toLowerCase() === address.toLowerCase()) {
              const tokenIdStr = index.toString()
              if (!depositedTokenIds.includes(tokenIdStr)) {
                ownedNFTs.push({
                  tokenId: tokenIdStr,
                  contract: contractAddresses.veNFT,
                  name: `veNFT #${index}`,
                  uniqueKey: `${contractAddresses.veNFT}-${tokenIdStr}`
                })
              }
            }
          }
        })
      }

      // Add rwaNFTs from wallet (ownerOf check)
      if (rwaNFTOwnershipChecks.data) {
        rwaNFTOwnershipChecks.data.forEach((result, index) => {
          if (result.status === 'success' && result.result) {
            const owner = result.result as string
            if (owner.toLowerCase() === address.toLowerCase()) {
              const tokenIdStr = index.toString()
              if (!depositedTokenIds.includes(tokenIdStr)) {
                ownedNFTs.push({
                  tokenId: tokenIdStr,
                  contract: contractAddresses.rwaNFT,
                  name: `RWA NFT #${index}`,
                  uniqueKey: `${contractAddresses.rwaNFT}-${tokenIdStr}`
                })
              }
            }
          }
        })
      }

      setWalletNFTs(ownedNFTs)
    }
  }, [veNFTOwnershipChecks.data, rwaNFTOwnershipChecks.data, address, contractAddresses.veNFT, contractAddresses.rwaNFT, depositedTokenIds])

  // Network utilities
  const networks = [
    { name: 'Base', id: 84532 },
    { name: 'Optimism', id: 11155420 },
    { name: 'Lisk', id: 4202 },
    { name: 'Ethereum', id: 11155111 },
    { name: 'Foundry', id: 31337 }
  ]

  const getNetworkCategory = (id: number) => {
    switch (id) {
      case 8453:
      case 84532: return 'Base'
      case 10:
      case 11155420: return 'Optimism'
      case 4202: return 'Lisk'
      case 1:
      case 11155111: return 'Ethereum'
      case 31337: return 'Foundry'
      default: return 'Unknown'
    }
  }

  const currentNetwork = getNetworkCategory(chainId)

  const handleNetworkSwitch = (networkId: number) => {
    switchChain({ chainId: networkId })
    setSelectedNFT(null)
  }

  return {
    walletNFTs,
    selectedNFT,
    setSelectedNFT,
    networks,
    currentNetwork,
    handleNetworkSwitch,
    depositedTokenIds
  }
}

