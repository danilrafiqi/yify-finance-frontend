// modules/admin/viewmodels/admin.viewmodel.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAccount, useReadContract, useWriteContract, usePublicClient, useChainId } from 'wagmi'
import { parseUnits, formatUnits, parseEther, erc20Abi } from 'viem'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import React from 'react'

import { useContractAddresses } from '../../../shared/hooks/use-contract-addresses'
import { usePlatformStats } from '../../../shared/hooks/use-platform-stats'
import { 
  SIMPLE_ORACLE_ABI, 
  YIELD_DISTRIBUTOR_ABI,
  UNIVERSAL_YIELD_GENERATOR_ABI,
  MOCK_USDC_ABI,
  MOCK_NFT_ABI,
  ADMIN_CONTRACT_ADDRESSES
} from '../../../constants/contracts'

export function useAdminViewModel() {
  const { address } = useAccount()
  const chainId = useChainId()
  const addresses = useContractAddresses()
  const adminAddresses = ADMIN_CONTRACT_ADDRESSES[chainId as keyof typeof ADMIN_CONTRACT_ADDRESSES]
  const queryClient = useQueryClient()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()
  const { tvl, totalBorrow, availableFund } = usePlatformStats()

  // States
  const [globalYieldAmount, setGlobalYieldAmount] = useState('')
  const [specificYieldAmount, setSpecificYieldAmount] = useState('')
  const [specificNFTAddress, setSpecificNFTAddress] = useState<string>(addresses.veNFT)
  const [specificTokenId, setSpecificTokenId] = useState('')
  const [processYieldNFT, setProcessYieldNFT] = useState<string>(addresses.veNFT)
  const [processYieldTokenId, setProcessYieldTokenId] = useState('')
  const [mintUSDCAmount, setMintUSDCAmount] = useState('')
  const [nftPrice, setNftPrice] = useState('')
  const [nftType, setNftType] = useState<'veNFT' | 'rwaNFT'>('veNFT')

  // Read USDC balance
  const { data: usdcBalance } = useReadContract({
    address: addresses.usdc as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: !!address }
  })

  const usdcBalanceValue = usdcBalance ? parseFloat(formatUnits(usdcBalance, 6)) : 0

  // Global Yield Mutation
  const globalYieldMutation = useMutation({
    mutationFn: async (amount: string) => {
      if (!adminAddresses?.yieldGenerator) {
        throw new Error('Yield generator not available')
      }

      const hash = await writeContractAsync({
        address: adminAddresses.yieldGenerator as `0x${string}`,
        abi: UNIVERSAL_YIELD_GENERATOR_ABI,
        functionName: 'generateGlobalYield',
        args: [parseUnits(amount, 6)]
      })

      await publicClient?.waitForTransactionReceipt({ hash })
      return hash
    },
    onSuccess: () => {
      toast.success('Global yield simulated!')
      setGlobalYieldAmount('')
      queryClient.invalidateQueries({ queryKey: ['platformStats'] })
    },
    onError: (error: Error) => {
      if (error.message?.includes('Ownable') || error.message?.includes('caller is not the owner')) {
        toast.error('Only contract owner can simulate global yield')
      } else {
        toast.error(error.message || 'Failed to simulate yield')
      }
    }
  })

  // Specific Yield Mutation
  const specificYieldMutation = useMutation({
    mutationFn: async (params: { nftAddress: string; tokenId: string; amount: string }) => {
      if (!adminAddresses?.yieldGenerator) {
        throw new Error('Yield generator not available')
      }

      const hash = await writeContractAsync({
        address: adminAddresses.yieldGenerator as `0x${string}`,
        abi: UNIVERSAL_YIELD_GENERATOR_ABI,
        functionName: 'simulateYield',
        args: [params.nftAddress as `0x${string}`, BigInt(params.tokenId), parseUnits(params.amount, 6)]
      })

      await publicClient?.waitForTransactionReceipt({ hash })
      return hash
    },
    onSuccess: () => {
      toast.success('Yield simulated!')
      setSpecificYieldAmount('')
      setSpecificTokenId('')
      queryClient.invalidateQueries({ queryKey: ['platformStats'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to simulate yield')
    }
  })

  // Process Yield Mutation
  const processYieldMutation = useMutation({
    mutationFn: async (params: { nftAddress: string; tokenId: string }) => {
      if (!addresses.yieldDistributor) {
        throw new Error('Yield distributor not configured')
      }

      const hash = await writeContractAsync({
        address: addresses.yieldDistributor as `0x${string}`,
        abi: YIELD_DISTRIBUTOR_ABI,
        functionName: 'claimAndDistribute',
        args: [params.nftAddress as `0x${string}`, BigInt(params.tokenId)]
      })

      await publicClient?.waitForTransactionReceipt({ hash })
      return hash
    },
    onSuccess: () => {
      toast.success('Yield processed!')
      setProcessYieldTokenId('')
      queryClient.invalidateQueries({ queryKey: ['platformStats'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to process yield')
    }
  })

  // Mint USDC Mutation
  const mintUSDCMutation = useMutation({
    mutationFn: async (amount: string) => {
      const hash = await writeContractAsync({
        address: addresses.usdc as `0x${string}`,
        abi: MOCK_USDC_ABI,
        functionName: 'mintPublic',
        args: [address!, parseUnits(amount, 6)]
      })

      await publicClient?.waitForTransactionReceipt({ hash })
      return hash
    },
    onSuccess: () => {
      toast.success(`Minted ${mintUSDCAmount} USDC!`)
      setMintUSDCAmount('')
      queryClient.invalidateQueries({ queryKey: ['balance'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mint USDC')
    }
  })

  // Set NFT Price Mutation
  const setNFTPriceMutation = useMutation({
    mutationFn: async (params: { nftAddress: string; tokenId: string; price: string }) => {
      const hash = await writeContractAsync({
        address: addresses.nftOracle as `0x${string}`,
        abi: SIMPLE_ORACLE_ABI,
        functionName: 'setTokenPrice',
        args: [
          params.nftAddress as `0x${string}`,
          BigInt(params.tokenId),
          parseEther(params.price) // Oracle uses 18 decimals
        ]
      })

      await publicClient?.waitForTransactionReceipt({ hash })
      return hash
    },
    onSuccess: () => {
      toast.success('NFT price set!')
      setNftPrice('')
      queryClient.invalidateQueries({ queryKey: ['nftPrice'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to set NFT price')
    }
  })

  // Mint NFT with Price Mutation
  const mintNFTMutation = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error('Please connect wallet')
      if (!nftPrice || isNaN(Number(nftPrice))) throw new Error('Please enter a valid price')

      const nftAddress = nftType === 'veNFT' ? addresses.veNFT : addresses.rwaNFT

      // 1. Mint NFT
      toast.loading('Step 1/2: Minting NFT...', { id: 'mint-admin-toast' })
      const mintHash = await writeContractAsync({
        address: nftAddress as `0x${string}`,
        abi: MOCK_NFT_ABI,
        functionName: 'mint',
        args: [address]
      })

      // Wait for confirmation and get token ID
      const receipt = await publicClient?.waitForTransactionReceipt({ hash: mintHash })
      if (!receipt) throw new Error('Failed to get mint receipt')

      // Extract token ID from Transfer event
      const transferLog = receipt.logs.find(log =>
        log.address.toLowerCase() === nftAddress.toLowerCase() &&
        log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
      )

      if (!transferLog?.topics[3]) {
        throw new Error('Could not find Token ID in logs')
      }

      const mintedId = BigInt(transferLog.topics[3])

      // 2. Set Price
      toast.loading(`Step 2/2: Setting Price to $${nftPrice}...`, { id: 'mint-admin-toast' })
      await writeContractAsync({
        address: addresses.nftOracle as `0x${string}`,
        abi: SIMPLE_ORACLE_ABI,
        functionName: 'setTokenPrice',
        args: [nftAddress as `0x${string}`, mintedId, parseEther(nftPrice)]
      })

      return { tokenId: mintedId.toString(), nftType }
    },
    onSuccess: (data) => {
      toast.success(`${data.nftType} #${data.tokenId} minted with value $${nftPrice}!`, { id: 'mint-admin-toast' })
      setNftPrice('')
      queryClient.invalidateQueries({ queryKey: ['nftPrice'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || `Failed to mint ${nftType}`, { id: 'mint-admin-toast' })
    }
  })

  return {
    // Platform stats
    tvl,
    totalBorrow,
    availableFund,
    usdcBalance: usdcBalanceValue,

    // States
    globalYieldAmount,
    setGlobalYieldAmount,
    specificYieldAmount,
    setSpecificYieldAmount,
    specificNFTAddress,
    setSpecificNFTAddress,
    specificTokenId,
    setSpecificTokenId,
    processYieldNFT,
    setProcessYieldNFT,
    processYieldTokenId,
    setProcessYieldTokenId,
    mintUSDCAmount,
    setMintUSDCAmount,
    nftPrice,
    setNftPrice,
    nftType,
    setNftType,

    // Actions
    generateGlobalYield: globalYieldMutation.mutate,
    simulateSpecificYield: specificYieldMutation.mutate,
    processYield: processYieldMutation.mutate,
    mintUSDC: mintUSDCMutation.mutate,
    setNFTPrice: setNFTPriceMutation.mutate,
    mintNFT: mintNFTMutation.mutate,

    // Loading states
    isGeneratingGlobalYield: globalYieldMutation.isPending,
    isSimulatingYield: specificYieldMutation.isPending,
    isProcessingYield: processYieldMutation.isPending,
    isMintingUSDC: mintUSDCMutation.isPending,
    isSettingPrice: setNFTPriceMutation.isPending,
    isMintingNFT: mintNFTMutation.isPending,

    // Utils
    adminAddresses,
    addresses,

    // Handler functions
    handleGlobalYield: (e: React.FormEvent) => {
      e.preventDefault()
      if (globalYieldAmount) {
        globalYieldMutation.mutate(globalYieldAmount)
      }
    },
    handleSpecificYield: (e: React.FormEvent) => {
      e.preventDefault()
      if (specificYieldAmount && specificTokenId) {
        specificYieldMutation.mutate({
          nftAddress: specificNFTAddress,
          tokenId: specificTokenId,
          amount: specificYieldAmount
        })
      }
    },
    handleProcessYield: (e: React.FormEvent) => {
      e.preventDefault()
      if (processYieldTokenId) {
        processYieldMutation.mutate({
          nftAddress: processYieldNFT,
          tokenId: processYieldTokenId
        })
      }
    },
    handleMintUSDC: (e: React.FormEvent) => {
      e.preventDefault()
      if (mintUSDCAmount) {
        mintUSDCMutation.mutate(mintUSDCAmount)
      }
    },
    handleMintNFT: (e: React.FormEvent) => {
      e.preventDefault()
      if (nftPrice) {
        mintNFTMutation.mutate()
      }
    },
    isLoading: globalYieldMutation.isPending || specificYieldMutation.isPending || processYieldMutation.isPending || mintUSDCMutation.isPending || setNFTPriceMutation.isPending || mintNFTMutation.isPending
  }
}

