// modules/lend/viewmodels/dashboard.viewmodel.ts
import { useQuery } from '@tanstack/react-query'
import { useAccount, useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { useMemo } from 'react'

import { calculateYieldEarned } from '../models/position'
import { LenderService } from '../services/lender.service'
import { useContractAddresses } from '../../../shared/hooks/use-contract-addresses'
import { LENDING_POOL_ABI } from '../../../constants/contracts'
import { query } from '../../../shared/lib/graphql'

export function useDashboardViewModel() {
  const { address } = useAccount()
  const addresses = useContractAddresses()

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
        query GetLenderTransactions($where: DepositWithdrawEventFilter!, $orderBy: String!, $limit: Int!) {
          depositWithdrawEvents(where: $where, orderBy: $orderBy, limit: $limit) {
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
        where: { user: address.toLowerCase() },
        orderBy: "timestamp",
        limit: 20
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
    if (!lenderPosition) return 0
    const yieldBigInt = calculateYieldEarned(lenderPosition)
    return parseFloat(formatUnits(yieldBigInt, 6))
  }, [lenderPosition])

  const apr = 20.0 // Hardcoded for now

  const isLoading = isLoadingShares || isLoadingAssets || isLoadingPonder

  return {
    // State
    lenderPosition,
    transactions: transactionsData || [],
    shares: userShares ? userShares.toString() : '0',
    
    // Computed
    currentValue,
    totalDeposited,
    totalWithdrawn,
    yieldEarned,
    apr,
    
    // Loading states
    isLoading,
    isLoadingTransactions,
    isLoadingPonder,
    
    // Errors
    ponderError
  }
}

