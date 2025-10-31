import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { usePositionStore } from '../stores/positionStore'
import { useNFTStore } from '../stores/nftStore'
import { useTransactionStore } from '../stores/transactionStore'
import { useWalletStore } from '../stores/walletStore'

interface RepayFormData {
  amount: number
  repayType: 'partial' | 'full'
  confirmRepay: boolean
}

const RepayInterface: React.FC = () => {
  const [repayAmount, setRepayAmount] = useState<number>(0)
  const [repayType, setRepayType] = useState<'partial' | 'full'>('partial')
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<RepayFormData>()

  const { positions, repayPosition } = usePositionStore()
  const { getNFTsByPosition } = useNFTStore()
  const { addTransaction } = useTransactionStore()
  const { updateBalance } = useWalletStore()

  // Get borrow positions with debt (borrow-*)
  const borrowPositions = positions.filter(pos => pos.id.startsWith('borrow-') && pos.status === 'active' && pos.borrowedAmount > 0)
  const activeBorrowPosition = borrowPositions[0] // Get first borrow position with debt

  const position = activeBorrowPosition ? {
    id: activeBorrowPosition.id,
    collateralNFTs: getNFTsByPosition(activeBorrowPosition.id).map(nft => nft.name),
    totalDebt: activeBorrowPosition.borrowedAmount, // No interest in this model
    accruedInterest: 0, // No ongoing interest
    principal: activeBorrowPosition.borrowedAmount,
    originationFee: activeBorrowPosition.originationFee,
    autoRepaymentEnabled: true,
    estimatedPayoffMonths: activeBorrowPosition.borrowedAmount > 0 ? Math.ceil((activeBorrowPosition.borrowedAmount * 1.1) / (activeBorrowPosition.yieldEarned * 0.75 / 12)) : 0,
    yieldEarned: activeBorrowPosition.yieldEarned
  } : null

  const calculateSavings = (amount: number) => {
    // In this model, there are no ongoing interest charges
    // "Savings" would be from avoiding other lending platforms
    return amount * 0.02 // Assume 2% annual savings vs traditional lending
  }

  const onSubmit = async (data: RepayFormData) => {
    if (!position) {
      alert('❌ No active position with debt found.')
      return
    }

    if (data.confirmRepay) {
      try {
        const finalAmount = repayType === 'full' ? position.totalDebt : data.amount

        // Simulate blockchain transaction
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Update position
        repayPosition(position.id, finalAmount)

        // Deduct from wallet balance
        updateBalance(-finalAmount)

        // Add transaction record
        addTransaction({
          type: 'repay',
          amount: finalAmount,
          token: 'USDC',
          positionId: position.id,
          status: 'confirmed',
          gasUsed: 120000,
          description: repayType === 'full'
            ? `Full repayment of ${finalAmount} USDC`
            : `Partial repayment of ${finalAmount} USDC`
        })

        alert(`✅ Successfully repaid ${finalAmount.toLocaleString()} USDC!`)
        setRepayAmount(0)

      } catch (error) {
        console.error('Repay failed:', error)
        addTransaction({
          type: 'repay',
          amount: repayType === 'full' ? position.totalDebt : repayAmount,
          token: 'USDC',
          positionId: position.id,
          status: 'failed',
          description: 'Repayment transaction failed'
        })
        alert('❌ Repayment failed. Please try again.')
      }
    }
  }

  if (!position) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Repay Loan</h2>
          <div className="text-center py-12">
            <p className="text-gray-500">No active positions with outstanding debt found.</p>
            <p className="text-sm text-gray-400 mt-2">Deposit NFTs and borrow first to have debt to repay.</p>
          </div>
        </div>
      </div>
    )
  }

  const maxRepay = repayType === 'full' ? position.totalDebt : position.totalDebt * 2 // Allow overpayment for full closure

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Repay Loan</h2>

        {/* Current Debt Summary */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Current Position</h3>

          {/* Collateral NFTs */}
          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-1">Collateral NFTs:</p>
            <div className="flex flex-wrap gap-2">
              {position.collateralNFTs.map((nft, index) => (
                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {nft}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Principal</p>
              <p className="font-medium">${position.principal.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Origination Fee</p>
              <p className="font-medium text-orange-600">${position.originationFee.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Debt</p>
              <p className="font-bold text-lg">${position.totalDebt.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-600">Combined Yield</p>
              <p className="font-medium text-green-600">${position.yieldEarned.toFixed(2)}</p>
            </div>
          </div>

          {position.autoRepaymentEnabled && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <p className="text-green-800 text-sm">
                ✅ <strong>Yield Auto-Repayment Active:</strong> 75% of NFT yield automatically repays this loan.
                Estimated full payoff in {position.estimatedPayoffMonths} months.
              </p>
              <p className="text-green-700 text-xs mt-1">
                💰 No ongoing interest - only one-time origination fee!
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Repay Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Repayment Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="partial"
                  checked={repayType === 'partial'}
                  onChange={(e) => setRepayType(e.target.value as 'partial' | 'full')}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Partial Repayment</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="full"
                  checked={repayType === 'full'}
                  onChange={(e) => setRepayType(e.target.value as 'partial' | 'full')}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Full Repayment (Close Position)</span>
              </label>
            </div>
          </div>

          {/* Repay Amount Input */}
          {repayType === 'partial' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repay Amount (USDC)
              </label>
              <div className="relative">
                <input
                  type="number"
                  {...register('amount', {
                    required: repayType === 'partial' ? 'Amount is required' : false,
                    min: { value: 1, message: 'Minimum repay amount is 1 USDC' },
                    max: { value: maxRepay, message: 'Amount exceeds maximum allowed' }
                  })}
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount"
                />
                <span className="absolute right-3 top-2 text-gray-500">USDC</span>
              </div>
              {errors.amount && (
                <p className="text-red-600 text-sm mt-1">{errors.amount.message}</p>
              )}

              {/* Quick Amount Buttons */}
              <div className="flex space-x-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setRepayAmount(position.accruedInterest)
                    setValue('amount', position.accruedInterest)
                  }}
                  className="px-3 py-1 text-sm bg-orange-100 hover:bg-orange-200 text-orange-800 rounded"
                >
                  Interest Only
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const half = Math.floor(position.totalDebt / 2)
                    setRepayAmount(half)
                    setValue('amount', half)
                  }}
                  className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded"
                >
                  Half Debt
                </button>
              </div>
            </div>
          )}

          {/* Repayment Summary */}
          {(repayAmount > 0 || repayType === 'full') && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-3">Repayment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Repay Amount:</span>
                  <span className="font-medium">
                    ${repayType === 'full' ? position.totalDebt.toFixed(2) : repayAmount.toLocaleString()} USDC
                  </span>
                </div>

                {repayType === 'partial' && repayAmount > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Interest Savings (est.):</span>
                      <span className="font-medium text-green-600">
                        +${calculateSavings(repayAmount).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Remaining Debt:</span>
                      <span className="font-medium">
                        ${(position.totalDebt - repayAmount).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}

                {repayType === 'full' && (
                  <div className="flex justify-between">
                    <span className="text-blue-700">NFT Unlock:</span>
                    <span className="font-medium text-green-600">Available after repayment</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Confirmation Checkbox */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="confirmRepay"
              {...register('confirmRepay', { required: 'You must confirm the repayment' })}
              className="mt-1 h-4 w-4 text-blue-600"
            />
            <label htmlFor="confirmRepay" className="text-sm text-gray-700">
              I confirm this repayment and understand the transaction details.
              {repayType === 'full' && ' This will close the position and unlock my NFT.'}
            </label>
          </div>
          {errors.confirmRepay && (
            <p className="text-red-600 text-sm">{errors.confirmRepay.message}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              (repayType === 'partial' && repayAmount === 0) ||
              (repayType === 'full' && position.totalDebt === 0)
            }
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700"
          >
            {repayType === 'full' ? 'Repay Full Amount' : `Repay ${repayAmount || 0} USDC`}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RepayInterface
