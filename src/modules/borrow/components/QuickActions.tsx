// modules/borrow/components/QuickActions.tsx
import React from 'react'
import { Wallet, ArrowUpRight, Loader2 } from 'lucide-react'
interface QuickActionsProps {
  manualRepayAmount: string
  onManualRepayAmountChange: (value: string) => void
  onRepay: (amount: string) => void
  onWithdraw: () => void
  isRepaying: boolean
  isWithdrawing: boolean
  needsApproval: boolean
  remainingDebt: number
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  manualRepayAmount,
  onManualRepayAmountChange,
  onRepay,
  onWithdraw,
  isRepaying,
  isWithdrawing,
  needsApproval,
  remainingDebt
}) => {
  const handleRepaySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualRepayAmount && Number(manualRepayAmount) > 0) {
      onRepay(manualRepayAmount)
    }
  }

  return (
    <div className="card-neo bg-white space-y-4">
      <h3 className="text-xl font-black uppercase">Quick Actions</h3>

      <div className="border-b-4 border-black pb-4 mb-4">
        <h4 className="font-bold uppercase mb-2">Manual Repay</h4>
        <form onSubmit={handleRepaySubmit} className="flex gap-2">
          <input
            type="number"
            placeholder="Amount"
            value={manualRepayAmount}
            onChange={(e) => onManualRepayAmountChange(e.target.value)}
            className="w-full border-2 border-black p-2 font-bold focus:outline-none focus:bg-neo-yellow"
            disabled={isRepaying}
          />
          <button
            type="submit"
            disabled={isRepaying || !manualRepayAmount}
            className="btn-neo bg-black text-white p-2 min-w-[50px] flex justify-center items-center"
          >
            {isRepaying ? (
              <Loader2 className="animate-spin" size={20} />
            ) : needsApproval && Number(manualRepayAmount) > 0 ? (
              "Approve"
            ) : (
              <Wallet size={20} />
            )}
          </button>
        </form>
        {needsApproval && Number(manualRepayAmount) > 0 && (
          <p className="text-xs text-gray-500 mt-1">Approval required first</p>
        )}
      </div>

      <button
        onClick={onWithdraw}
        disabled={remainingDebt > 0.01 || isWithdrawing}
        className={`w-full btn-neo flex items-center justify-center gap-2 ${
          remainingDebt > 0.01
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-400'
            : 'bg-white hover:bg-red-50 text-red-600'
        }`}
      >
        {isWithdrawing ? <Loader2 className="animate-spin" /> : <ArrowUpRight size={20} />}
        Withdraw NFT
      </button>
    </div>
  )
}

