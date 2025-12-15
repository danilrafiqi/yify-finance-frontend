// modules/lend/viewmodels/dashboard.viewmodel.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAccount, useReadContract, useWriteContract, usePublicClient } from 'wagmi'
import { formatUnits, parseUnits } from 'viem'
import { useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { LenderService } from '../services/lender.service'
import { useContractAddresses } from '../../../shared/hooks/use-contract-addresses'
import { LENDING_POOL_ABI } from '../../../constants/contracts'
import { query } from '../../../shared/lib/graphql'

export function useDashboardViewModel() {
  const { address } = useAccount()
  const addresses = useContractAddresses()
  const queryClient = useQueryClient()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()
  
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0)

  // Get lender position from indexer
  const { data: lenderData, isLoading: isLoadingPonder, error: ponderError } = useQuery({
    queryKey: ['lenderPosition', address],
    queryFn: async () => {
      if (!address) return null

      const data = await query<{ lenderPositions: { items: any[] } }>(`
        query GetLenderPosition($where: LenderPositionFilter!) {
          lenderPositions(where: $where) {
            items {
              id
              user
              totalDeposited
              totalWithdrawn
              currentBalance
              updatedAt
            }
          }
        }
      `, {
        where: { user: address.toLowerCase() }
      })

      return data.lenderPositions.items[0] || null
    },
    enabled: !!address,
    staleTime: 10000,
    refetchInterval: 30000
  })

  const lenderPosition = useMemo(() => {
    return lenderData ? LenderService.toLenderPosition(lenderData) : null
  }, [lenderData])

  // Get transaction history
  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['lenderTransactions', address],
    queryFn: async () => {
      if (!address) return []

      const data = await query<{ depositWithdrawEvents: { items: any[] } }>(`
        query GetLenderTransactions($where: DepositWithdrawEventFilter!) {
          depositWithdrawEvents(
            where: $where
            orderBy: "timestamp"
            orderDirection: "desc"
            limit: 20
          ) {
            items {
              id
              user
              type
              assets
              shares
              timestamp
              txHash
              blockNumber
            }
          }
        }
      `, {
        where: { user: address.toLowerCase() }
      })

      return LenderService.toDepositWithdrawEvents(data.depositWithdrawEvents.items)
    },
    enabled: !!address,
    staleTime: 10000,
    refetchInterval: 30000
  })

  // Read user shares from contract (real-time)
  const { data: userShares, isLoading: isLoadingShares } = useReadContract({
    address: addresses.lendingPool as `0x${string}`,
    abi: LENDING_POOL_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: !!address }
  })

  // Read share value in assets (real-time)
  const { data: userAssets, isLoading: isLoadingAssets } = useReadContract({
    address: addresses.lendingPool as `0x${string}`,
    abi: LENDING_POOL_ABI,
    functionName: 'convertToAssets',
    args: [userShares || 0n],
    query: { enabled: !!userShares }
  })

  // Read total assets and total borrowed to calculate available liquidity
  const { data: totalAssets } = useReadContract({
    address: addresses.lendingPool as `0x${string}`,
    abi: LENDING_POOL_ABI,
    functionName: 'totalAssets',
    query: { enabled: true }
  })

  const { data: totalBorrowed } = useReadContract({
    address: addresses.lendingPool as `0x${string}`,
    abi: LENDING_POOL_ABI,
    functionName: 'totalBorrowed',
    query: { enabled: true }
  })

  // Calculate available liquidity for withdrawal
  const availableLiquidity = useMemo(() => {
    if (!totalAssets || !totalBorrowed) return 0
    const available = totalAssets - totalBorrowed
    return parseFloat(formatUnits(available > 0n ? available : 0n, 6))
  }, [totalAssets, totalBorrowed])

  // Computed values
  const currentValue = useMemo(() => {
    return userAssets ? parseFloat(formatUnits(userAssets, 6)) : 0
  }, [userAssets])

  const totalDeposited = useMemo(() => {
    return lenderPosition 
      ? parseFloat(formatUnits(lenderPosition.totalDeposited, 6))
      : 0
  }, [lenderPosition])

  const totalWithdrawn = useMemo(() => {
    return lenderPosition
      ? parseFloat(formatUnits(lenderPosition.totalWithdrawn, 6))
      : 0
  }, [lenderPosition])

  const yieldEarned = useMemo(() => {
    // Calculate yield earned using currentValue from contract (which includes yield)
    // instead of currentBalance from indexer (which only tracks deposit/withdraw)
    if (!lenderPosition || !userAssets) return 0
    
    const netDeposited = lenderPosition.totalDeposited - lenderPosition.totalWithdrawn
    const currentValueBigInt = userAssets
    
    if (currentValueBigInt > netDeposited) {
      const yieldBigInt = currentValueBigInt - netDeposited
      return parseFloat(formatUnits(yieldBigInt, 6))
    }
    return 0
  }, [lenderPosition, userAssets])

  const apr = 20.0 // Hardcoded for now

  const isLoading = isLoadingShares || isLoadingAssets || isLoadingPonder

  // Format transactions with formatted amounts
  const transactions = useMemo(() => {
    if (!transactionsData) return []
    return transactionsData.map(tx => ({
      ...tx,
      formattedAmount: Number(formatUnits(tx.assets, 6))
    }))
  }, [transactionsData])

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: async (amount: number) => {
      if (!address || !userShares || amount <= 0) {
        throw new Error('Invalid amount')
      }

      // Validate withdraw amount
      const validation = LenderService.validateWithdrawAmount(amount, currentValue)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Check available liquidity
      if (amount > availableLiquidity) {
        throw new Error(`Insufficient pool liquidity. Available: $${availableLiquidity.toFixed(2)}`)
      }

      // Calculate shares to withdraw based on amount
      // We need to convert assets to shares using readContract
      if (!publicClient) {
        throw new Error('Public client not available')
      }

      const sharesToWithdraw = await publicClient.readContract({
        address: addresses.lendingPool as `0x${string}`,
        abi: LENDING_POOL_ABI,
        functionName: 'convertToShares',
        args: [parseUnits(amount.toString(), 6)]
      })

      if (!sharesToWithdraw || sharesToWithdraw === 0n) {
        throw new Error('Invalid shares calculation')
      }

      // Check if user has enough shares
      if (sharesToWithdraw > userShares) {
        throw new Error('Insufficient shares')
      }

      const hash = await writeContractAsync({
        address: addresses.lendingPool as `0x${string}`,
        abi: LENDING_POOL_ABI,
        functionName: 'withdraw',
        args: [sharesToWithdraw]
      })

      await publicClient.waitForTransactionReceipt({ hash })
      return hash
    },
    onSuccess: () => {
      toast.success(`Successfully withdrew $${withdrawAmount.toLocaleString()}`)
      setWithdrawAmount(0)
      queryClient.invalidateQueries({ queryKey: ['lenderPosition', address] })
      queryClient.invalidateQueries({ queryKey: ['lenderTransactions', address] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Withdraw failed')
    }
  })

  return {
    // State
    lenderPosition,
    transactions,
    shares: userShares ? userShares.toString() : '0',
    withdrawAmount,
    setWithdrawAmount,
    
    // Computed
    currentValue,
    totalDeposited,
    totalWithdrawn,
    yieldEarned,
    apr,
    availableLiquidity,
    
    // Actions
    withdraw: withdrawMutation.mutate,
    
    // Loading states
    isLoading,
    isLoadingTransactions,
    isLoadingPonder,
    isWithdrawing: withdrawMutation.isPending,
    
    // Errors
    ponderError
  }
}

