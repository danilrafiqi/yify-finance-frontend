// modules/borrow/services/loan.service.ts
import { Loan, toLoan } from '../models/loan'
import { formatUnits } from 'viem'

/**
 * Loan service - Business logic untuk loan operations
 */
export class LoanService {
  /**
   * Validate repay amount
   */
  static validateRepayAmount(loan: Loan, amount: string): { valid: boolean; error?: string } {
    if (!amount || amount === '0' || Number(amount) <= 0) {
      return { valid: false, error: 'Invalid amount' }
    }

    const remainingDebt = parseFloat(formatUnits(loan.remainingDebt, 6))
    const repayAmount = Number(amount)

    if (repayAmount > remainingDebt + 0.1) { // Small buffer for rounding
      return { 
        valid: false, 
        error: `Amount exceeds remaining debt ($${remainingDebt.toFixed(2)})` 
      }
    }

    return { valid: true }
  }

  /**
   * Validate withdraw
   */
  static validateWithdraw(loan: Loan): { valid: boolean; error?: string } {
    if (!loan.isActive) {
      return { valid: false, error: 'Loan is not active' }
    }

    if (loan.remainingDebt > 0n) {
      const remainingDebt = parseFloat(formatUnits(loan.remainingDebt, 6))
      return { 
        valid: false, 
        error: `Cannot withdraw: debt remaining ($${remainingDebt.toFixed(2)})` 
      }
    }

    return { valid: true }
  }

  /**
   * Transform contract response to Loan
   */
  static toLoan(data: any): Loan {
    return toLoan(data)
  }

  /**
   * Transform array of contract responses to Loans
   */
  static toLoans(data: any[]): Loan[] {
    return data.map(toLoan)
  }

  /**
   * Find loan by token ID
   */
  static findLoanByTokenId(loans: Loan[], tokenId: string): Loan | undefined {
    return loans.find(loan => loan.tokenId.toString() === tokenId && loan.isActive)
  }
}

