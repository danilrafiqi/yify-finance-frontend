// modules/borrow/viewmodels/detail.viewmodel.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAccount, useReadContract, useWriteContract, usePublicClient } from 'wagmi'
import { formatUnits, parseUnits, erc20Abi } from 'viem'
import { useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'

import { calculateRepaymentProgress } from '../models/loan'
import { LoanService } from '../services/loan.service'
import { useContractAddresses } from '../../../shared/hooks/use-contract-addresses'
import { LOAN_MANAGER_ABI, LENS_ABI, SIMPLE_ORACLE_ABI, YIELD_DISTRIBUTOR_ABI } from '../../../constants/contracts'
import { query } from '../../../shared/lib/graphql'

export interface YieldEvent {
  id: string
  loanId: string
  asset: string
  tokenId: string
  totalAmount: string
  repaidDebt: string
  lenderYield: string
  protocolFee: string
  timestamp: string
}

export function useDetailViewModel(tokenId?: string) {
  const { address } = useAccount()
  const addresses = useContractAddresses()
  const queryClient = useQueryClient()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()

  // Local state untuk UI
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'settings'>('overview')
  const [manualRepayAmount, setManualRepayAmount] = useState<string>('')
  const [chartRange, setChartRange] = useState<'1W' | '1M' | '3M' | 'ALL'>('1M')
  const [chartType, setChartType] = useState<'yield' | 'debt' | 'cumulative'>('yield')
  const [claimingSimulationId] = useState<string | null>(null)

  // Load user loans from Lens
  const { data: userPositionsResult, isLoading: isLoadingPositions, refetch: refetchPositions } = useReadContract({
    address: addresses.lens as `0x${string}`,
    abi: LENS_ABI,
    functionName: 'getUserLoans',
    args: [addresses.loanManager, address!],
    query: { enabled: !!address && !!addresses.loanManager, refetchInterval: 5000 }
  })

  // Find loan by token ID
  const loan = useMemo(() => {
    if (!userPositionsResult || !tokenId) return undefined
    const positions = userPositionsResult as any[]
    const position = positions.find((p: any) => p.tokenId.toString() === tokenId && p.isActive)
    return position ? LoanService.toLoan(position) : undefined
  }, [userPositionsResult, tokenId])

  // Get NFT value from Oracle
  const { data: nftValueData } = useReadContract({
    address: addresses.nftOracle as `0x${string}`,
    abi: SIMPLE_ORACLE_ABI,
    functionName: 'getAssetPrice',
    args: [loan?.nftContract as `0x${string}`, loan?.tokenId as bigint],
    query: { enabled: !!loan && !!addresses.nftOracle }
  })

  const nftValue = nftValueData ? parseFloat(formatUnits(nftValueData as bigint, 18)) : 0

  // USDC Allowance Check
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: addresses.usdc as `0x${string}`,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address!, addresses.loanManager as `0x${string}`],
    query: { enabled: !!address && !!addresses.usdc && !!addresses.loanManager }
  })

  // Yield History
  const { data: yieldHistory = [], isLoading: isLoadingHistory, refetch: refetchHistory } = useQuery<YieldEvent[]>({
    queryKey: ['yieldHistory', loan?.nftContract, loan?.tokenId.toString()],
    queryFn: async () => {
      if (!loan) return []
      const loanId = `${loan.nftContract.toLowerCase()}-${loan.tokenId}`
      
      const data = await query<{ yieldEvents: { items: YieldEvent[] } }>(`
        query GetYieldEvents($loanId: String!) {
          yieldEvents(
            where: { loanId: $loanId }
            orderBy: "timestamp"
            orderDirection: "asc"
            limit: 100
          ) {
            items {
              id
              loanId
              asset
              tokenId
              totalAmount
              repaidDebt
              lenderYield
              protocolFee
              timestamp
            }
          }
        }
      `, { loanId })

      return data.yieldEvents.items
    },
    enabled: !!loan && activeTab === 'history',
    refetchInterval: 3000
  })

  // Computed values
  const repaymentProgress = useMemo(() => {
    return loan ? calculateRepaymentProgress(loan) : 0
  }, [loan])

  const totalBorrowed = useMemo(() => {
    return loan ? parseFloat(formatUnits(loan.totalBorrowed, 6)) : 0
  }, [loan])

  const remainingDebt = useMemo(() => {
    return loan ? parseFloat(formatUnits(loan.remainingDebt, 6)) : 0
  }, [loan])

  const repaid = useMemo(() => {
    return totalBorrowed - remainingDebt
  }, [totalBorrowed, remainingDebt])

  const needsApproval = useMemo(() => {
    if (!allowance || !manualRepayAmount) return true
    return allowance < parseUnits(manualRepayAmount || '0', 6)
  }, [allowance, manualRepayAmount])

  // Repay mutation
  const repayMutation = useMutation({
    mutationFn: async (amount: string) => {
      if (!loan) throw new Error('No loan found')
      
      // Validate
      const validation = LoanService.validateRepayAmount(loan, amount)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Check allowance
      const amountBigInt = parseUnits(amount, 6)
      if (!allowance || allowance < amountBigInt) {
        // Approve first
        const approveHash = await writeContractAsync({
          address: addresses.usdc as `0x${string}`,
          abi: erc20Abi,
          functionName: 'approve',
          args: [addresses.loanManager as `0x${string}`, amountBigInt]
        })
        await publicClient?.waitForTransactionReceipt({ hash: approveHash })
        toast.success('Approval sent! Please confirm repay.')
        await refetchAllowance()
        return null // Return null to indicate approval was needed
      }

      // Repay
      const hash = await writeContractAsync({
        address: addresses.loanManager as `0x${string}`,
        abi: LOAN_MANAGER_ABI,
        functionName: 'repay',
        args: [loan.nftContract, loan.tokenId, amountBigInt]
      })

      await publicClient?.waitForTransactionReceipt({ hash })
      return hash
    },
    onSuccess: (hash) => {
      if (hash) {
        toast.success('Repaid successfully!')
        queryClient.invalidateQueries({ queryKey: ['loan'] })
        refetchPositions()
        setManualRepayAmount('')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Repay failed')
    }
  })

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: async () => {
      if (!loan) throw new Error('No loan found')
      
      // Validate
      const validation = LoanService.validateWithdraw(loan)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      const hash = await writeContractAsync({
        address: addresses.loanManager as `0x${string}`,
        abi: LOAN_MANAGER_ABI,
        functionName: 'withdrawNFT',
        args: [loan.nftContract, loan.tokenId]
      })

      await publicClient?.waitForTransactionReceipt({ hash })
      return hash
    },
    onSuccess: () => {
      toast.success('NFT withdrawn successfully!')
        queryClient.invalidateQueries({ queryKey: ['loan'] })
      refetchPositions()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Withdraw failed')
    }
  })

  // Claim yield
  const claimYieldMutation = useMutation({
    mutationFn: async (event: YieldEvent) => {
      if (!addresses.yieldDistributor) {
        throw new Error('Yield distributor not configured')
      }

      const hash = await writeContractAsync({
        address: addresses.yieldDistributor as `0x${string}`,
        abi: YIELD_DISTRIBUTOR_ABI,
        functionName: 'claimAndDistribute',
        args: [event.asset as `0x${string}`, BigInt(event.tokenId)]
      })

      await publicClient?.waitForTransactionReceipt({ hash })
      return hash
    },
    onSuccess: () => {
      toast.success('Yield claimed & distributed')
      refetchHistory()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to claim yield')
    }
  })

  // Chart data
  const chartData = useMemo(() => {
    if (!yieldHistory || yieldHistory.length === 0) return []

    let filteredEvents = [...yieldHistory]
    const now = Date.now() / 1000
    let cutoff = 0

    if (chartRange === '1W') cutoff = now - 7 * 24 * 60 * 60
    if (chartRange === '1M') cutoff = now - 30 * 24 * 60 * 60
    if (chartRange === '3M') cutoff = now - 90 * 24 * 60 * 60
    if (chartRange === 'ALL') cutoff = 0

    filteredEvents = filteredEvents.filter((e) => Number(e.timestamp) >= cutoff)

    let cumulativeYield = 0
    let cumulativeDebtRepaid = 0

    return filteredEvents.map((e) => {
      const yieldAmount = parseFloat(formatUnits(BigInt(e.lenderYield), 6))
      const debtRepaid = parseFloat(formatUnits(BigInt(e.repaidDebt), 6))
      const protocolFee = parseFloat(formatUnits(BigInt(e.protocolFee), 6))
      const totalAmount = parseFloat(formatUnits(BigInt(e.totalAmount), 6))

      cumulativeYield += yieldAmount
      cumulativeDebtRepaid += debtRepaid

      return {
        date: new Date(Number(e.timestamp) * 1000).toISOString(),
        timestamp: Number(e.timestamp),
        yieldAmount,
        debtRepaid,
        protocolFee,
        totalAmount,
        cumulativeYield,
        cumulativeDebtRepaid
      }
    })
  }, [yieldHistory, chartRange])

  return {
    // State
    loan,
    isLoading: isLoadingPositions,
    error: null,
    
    // NFT data
    nftValue,
    
    // Computed
    repaymentProgress,
    totalBorrowed,
    remainingDebt,
    repaid,
    needsApproval,
    
    // Yield history
    yieldHistory,
    isLoadingHistory,
    chartData,
    
    // UI state
    activeTab,
    setActiveTab,
    manualRepayAmount,
    setManualRepayAmount,
    chartRange,
    setChartRange,
    chartType,
    setChartType,
    claimingSimulationId,
    
    // Actions
    repay: repayMutation.mutate,
    withdraw: withdrawMutation.mutate,
    claimYield: claimYieldMutation.mutate,
    isRepaying: repayMutation.isPending,
    isWithdrawing: withdrawMutation.isPending,
    isClaimingYield: claimYieldMutation.isPending,
    
    // Utils
    refetch: refetchPositions,
    refetchHistory
  }
}

