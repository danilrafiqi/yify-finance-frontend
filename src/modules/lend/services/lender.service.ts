// modules/lend/services/lender.service.ts
import { LenderPosition, DepositWithdrawEvent, toLenderPosition, toDepositWithdrawEvent } from '../models/position'

/**
 * Lender service - Business logic untuk lender operations
 */
export class LenderService {
  /**
   * Validate deposit amount
   */
  static validateDepositAmount(amount: number, balance: number): { valid: boolean; error?: string } {
    if (!amount || amount <= 0) {
      return { valid: false, error: 'Invalid amount' }
    }

    if (amount > balance) {
      return { valid: false, error: `Amount exceeds balance ($${balance.toFixed(2)})` }
    }

    return { valid: true }
  }

  /**
   * Validate withdraw amount
   */
  static validateWithdrawAmount(amount: number, availableBalance: number): { valid: boolean; error?: string } {
    if (!amount || amount <= 0) {
      return { valid: false, error: 'Invalid amount' }
    }

    if (amount > availableBalance) {
      return { valid: false, error: `Amount exceeds available balance ($${availableBalance.toFixed(2)})` }
    }

    return { valid: true }
  }

  /**
   * Transform GraphQL response to LenderPosition
   */
  static toLenderPosition(data: any): LenderPosition | null {
    if (!data) return null
    return toLenderPosition(data)
  }

  /**
   * Transform GraphQL response array to DepositWithdrawEvents
   */
  static toDepositWithdrawEvents(data: any[]): DepositWithdrawEvent[] {
    return data.map(toDepositWithdrawEvent)
  }
}

