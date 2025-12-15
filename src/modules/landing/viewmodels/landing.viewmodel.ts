// modules/landing/viewmodels/landing.viewmodel.ts
import { usePlatformStats } from '../../../shared/hooks/use-platform-stats'
import { formatUnits } from 'viem'
import { useMemo } from 'react'

export function useLandingViewModel() {
  const { tvl: tvlBigInt, totalBorrow: totalBorrowBigInt, availableFund: availableFundBigInt } = usePlatformStats()

  // Convert BigInt to display values
  const tvl = useMemo(() => {
    return tvlBigInt ? parseFloat(formatUnits(tvlBigInt, 6)) : 0
  }, [tvlBigInt])

  const totalBorrow = useMemo(() => {
    return totalBorrowBigInt ? parseFloat(formatUnits(totalBorrowBigInt, 6)) : 0
  }, [totalBorrowBigInt])

  const availableFund = useMemo(() => {
    return availableFundBigInt ? parseFloat(formatUnits(availableFundBigInt, 6)) : 0
  }, [availableFundBigInt])

  return {
    tvl,
    totalBorrow,
    availableFund
  }
}

