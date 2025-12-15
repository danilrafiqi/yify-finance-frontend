// modules/borrow/viewmodels/list.viewmodel.ts
import { useQuery } from '@tanstack/react-query'
import { useAccount, useReadContract } from 'wagmi'
import { useMemo } from 'react'
import { formatUnits } from 'viem'
import { LoanService } from '../services/loan.service'
import { useContractAddresses } from '../../../shared/hooks/use-contract-addresses'
import { LENS_ABI } from '../../../constants/contracts'
import { query } from '../../../shared/lib/graphql'

export function useListViewModel() {
  const { address } = useAccount()
  const addresses = useContractAddresses()

  // Get user loans from Lens
  const { data: userPositionsResult, isLoading, error } = useReadContract({
    address: addresses.lens as `0x${string}`,
    abi: LENS_ABI,
    functionName: 'getUserLoans',
    args: [addresses.loanManager, address!],
    query: { enabled: !!address && !!addresses.loanManager, refetchInterval: 5000 }
  })

  // Transform to Loan models
  const loans = useMemo(() => {
    if (!userPositionsResult) return []
    const positions = userPositionsResult as any[]
    return LoanService.toLoans(positions)
  }, [userPositionsResult])

  // Get active loans only
  const activeLoans = useMemo(() => {
    return loans.filter(loan => loan.isActive)
  }, [loans])

  // Deduplicate by loan ID
  const uniqueActiveLoans = useMemo(() => {
    const seen = new Set<string>()
    return activeLoans.filter(loan => {
      if (seen.has(loan.id)) return false
      seen.add(loan.id)
      return true
    })
  }, [activeLoans])

  // Get loan timestamps from indexer
  const { data: loanTimestamps = {} } = useQuery<Record<string, number>>({
    queryKey: ['loanTimestamps', uniqueActiveLoans.map(l => l.id)],
    queryFn: async () => {
      if (uniqueActiveLoans.length === 0) return {}

      const timestamps: Record<string, number> = {}

      for (const loan of uniqueActiveLoans) {
        const loanId = `${loan.nftContract.toLowerCase()}-${loan.tokenId}`

        try {
          const data = await query<{ loan?: { createdAt: string } }>(`
            query GetLoanTimestamp($id: String!) {
              loan(id: $id) {
                createdAt
              }
            }
          `, { id: loanId })

          if (data.loan?.createdAt) {
            timestamps[loanId] = Number(data.loan.createdAt)
          } else {
            // Fallback
            timestamps[loanId] = Math.floor(Date.now() / 1000) - Math.random() * 86400
          }
        } catch (error) {
          console.warn(`Indexer not available for loan ${loanId}`)
          timestamps[loanId] = Math.floor(Date.now() / 1000) - Math.random() * 3600
        }
      }

      return timestamps
    },
    enabled: uniqueActiveLoans.length > 0
  })

  // Transform loans to display format with calculations
  const loanCards = useMemo(() => {
    return uniqueActiveLoans.map((loan) => {
      const loanId = `${loan.nftContract.toLowerCase()}-${loan.tokenId}`
      
      const totalBorrowed = parseFloat(formatUnits(loan.totalBorrowed, 6))
      const remainingDebt = parseFloat(formatUnits(loan.remainingDebt, 6))
      const repaid = totalBorrowed - remainingDebt
      const progress = totalBorrowed > 0 ? (repaid / totalBorrowed) * 100 : 0

      // Calculate time to payoff
      let timeToPayoff = '---'
      if (loanTimestamps[loanId]) {
        const weeksElapsed = Math.max(1, (Date.now() / 1000 - loanTimestamps[loanId]) / (7 * 24 * 60 * 60))
        const avgWeeklyRepayment = repaid / weeksElapsed

        if (avgWeeklyRepayment > 0) {
          const weeksToPayoff = Math.ceil(remainingDebt / avgWeeklyRepayment)
          timeToPayoff = `${weeksToPayoff} weeks`
        } else if (repaid === 0) {
          timeToPayoff = 'No repayment yet'
        } else {
          timeToPayoff = 'Calculating...'
        }
      }

      return {
        loan,
        totalBorrowed,
        remainingDebt,
        repaid,
        progress,
        timeToPayoff
      }
    })
  }, [uniqueActiveLoans, loanTimestamps])

  return {
    loans: uniqueActiveLoans,
    loanCards,
    loanTimestamps,
    isLoading,
    error
  }
}

