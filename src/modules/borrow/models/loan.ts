// modules/borrow/models/loan.ts

export interface Loan {
  id: string
  borrower: `0x${string}`
  nftContract: `0x${string}`
  tokenId: bigint
  totalBorrowed: bigint
  remainingDebt: bigint
  isActive: boolean
}

/**
 * Calculate repayment progress percentage
 */
export function calculateRepaymentProgress(loan: Loan): number {
  if (loan.totalBorrowed === 0n) return 0
  const repaid = loan.totalBorrowed - loan.remainingDebt
  return Number((repaid * 10000n) / loan.totalBorrowed) / 100
}

/**
 * Check if loan can be withdrawn (no debt remaining)
 */
export function canWithdraw(loan: Loan): boolean {
  return loan.isActive && loan.remainingDebt === 0n
}

/**
 * Check if loan can borrow more (within LTV limits)
 */
export function canBorrowMore(loan: Loan, maxBorrow: bigint): boolean {
  return loan.remainingDebt < maxBorrow
}

/**
 * Transform contract response to Loan model
 */
export function toLoan(data: any): Loan {
  return {
    id: `${data.nftContract}-${data.tokenId}`,
    borrower: data.borrower,
    nftContract: data.nftContract,
    tokenId: data.tokenId,
    totalBorrowed: data.totalBorrowed,
    remainingDebt: data.remainingDebt,
    isActive: data.isActive
  }
}

