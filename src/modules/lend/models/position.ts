// modules/lend/models/position.ts

export interface LenderPosition {
  id: string
  user: `0x${string}`
  totalDeposited: bigint
  totalWithdrawn: bigint
  currentBalance: bigint
  updatedAt: bigint
}

export interface DepositWithdrawEvent {
  id: string
  user: `0x${string}`
  type: 'deposit' | 'withdraw'
  assets: bigint
  shares: bigint
  timestamp: bigint
  txHash: `0x${string}`
  blockNumber: bigint
}

/**
 * Calculate yield earned (current balance - net deposits)
 */
export function calculateYieldEarned(position: LenderPosition): bigint {
  const netDeposits = position.totalDeposited - position.totalWithdrawn
  if (position.currentBalance > netDeposits) {
    return position.currentBalance - netDeposits
  }
  return 0n
}

/**
 * Calculate APR (simplified, based on yield and time)
 */
export function calculateAPR(position: LenderPosition, timeElapsed: number): number {
  // Simplified APR calculation
  // In production, this would be more sophisticated
  const yieldEarned = calculateYieldEarned(position)
  if (yieldEarned === 0n || timeElapsed === 0) return 0
  
  // This is a placeholder - real APR calculation would need more data
  return 20.0 // Hardcoded for now
}

/**
 * Transform GraphQL response to LenderPosition
 */
export function toLenderPosition(data: any): LenderPosition {
  return {
    id: data.id,
    user: data.user as `0x${string}`,
    totalDeposited: BigInt(data.totalDeposited || '0'),
    totalWithdrawn: BigInt(data.totalWithdrawn || '0'),
    currentBalance: BigInt(data.currentBalance || '0'),
    updatedAt: BigInt(data.updatedAt || '0')
  }
}

/**
 * Transform GraphQL response to DepositWithdrawEvent
 */
export function toDepositWithdrawEvent(data: any): DepositWithdrawEvent {
  return {
    id: data.id,
    user: data.user as `0x${string}`,
    type: data.type as 'deposit' | 'withdraw',
    assets: BigInt(data.assets || '0'),
    shares: BigInt(data.shares || '0'),
    timestamp: BigInt(data.timestamp || '0'),
    txHash: data.txHash as `0x${string}`,
    blockNumber: BigInt(data.blockNumber || '0')
  }
}

