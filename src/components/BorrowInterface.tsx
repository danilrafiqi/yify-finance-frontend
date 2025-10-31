import React, { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { usePositionStore } from '../stores/positionStore'
import { useNFTStore } from '../stores/nftStore'
import { useTransactionStore } from '../stores/transactionStore'
import { useWalletStore } from '../stores/walletStore'

interface BorrowFormData {
  amount: number
  confirmBorrow: boolean
}

const BorrowInterface: React.FC = () => {
  const [borrowAmount, setBorrowAmount] = useState<number>(0)
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<BorrowFormData>()

  const { positions, borrowAdditional, getTotalCollateralValue, getWeightedLTV, getMaxBorrowAmount } = usePositionStore()
  const { getDepositedNFTs } = useNFTStore()
  const { addTransaction } = useTransactionStore()
  const { updateBalance } = useWalletStore()

  // Get all active collateral (all deposited NFTs)
  const depositedNFTs = getDepositedNFTs()
  const totalCollateralValue = getTotalCollateralValue()
  const weightedLTV = getWeightedLTV()
  const maxBorrowAmount = getMaxBorrowAmount()

  // Check if user can borrow (has deposited NFTs)
  const canBorrow = depositedNFTs.length > 0

  // Get current borrow position (if exists)
  const currentBorrowPosition = positions.find(p => p.id.startsWith('borrow-') && p.status === 'active')

  const borrowData = useMemo(() => {
    if (!canBorrow) {
      return {
        collateralNFTs: [],
        totalCollateralValue: 0,
        maxBorrowAmount: 0,
        currentBorrowed: 0,
        availableToBorrow: 0,
        originationFee: 0,
        yieldShare: 20
      }
    }

    return {
      collateralNFTs: depositedNFTs.map(nft => nft.name), // All deposited NFTs as collateral
      totalCollateralValue,
      maxBorrowAmount,
      currentBorrowed: currentBorrowPosition?.borrowedAmount || 0,
      availableToBorrow: Math.max(0, maxBorrowAmount - (currentBorrowPosition?.borrowedAmount || 0)),
      originationFee: borrowAmount * 0.005,
      yieldShare: 20
    }
  }, [canBorrow, depositedNFTs, totalCollateralValue, maxBorrowAmount, currentBorrowPosition, borrowAmount])

  const onSubmit = async (_data: BorrowFormData) => {
    if (!canBorrow) {
      alert('❌ No collateral available. Please deposit NFTs first.')
      return
    }

    if (borrowAmount <= 0) {
      alert('❌ Please enter a valid borrow amount.')
      return
    }

    if (borrowAmount > borrowData.availableToBorrow) {
      alert('❌ Borrow amount exceeds available limit.')
      return
    }

    try {
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Check if this is additional borrow or first borrow
      const existingBorrowPosition = positions.find(p => p.id.startsWith('borrow-') && p.status === 'active')
      const isAdditionalBorrow = !!existingBorrowPosition

      // Borrow additional amount (will create new position if none exists)
      const borrowPositionId = borrowAdditional(borrowAmount)

      // Update wallet balance
      updateBalance(borrowAmount)

      // Add transaction record
      addTransaction({
        type: 'borrow',
        amount: borrowAmount,
        token: 'USDC',
        status: 'confirmed',
        description: isAdditionalBorrow
          ? `Borrowed additional ${borrowAmount} USDC against ${depositedNFTs.length} deposited NFTs`
          : `Borrowed ${borrowAmount} USDC against ${depositedNFTs.length} deposited NFTs`,
        positionId: borrowPositionId
      })

      // Reset form
      setBorrowAmount(0)
      setValue('amount', 0)

      alert(`✅ ${isAdditionalBorrow ? 'Additional borrow' : 'Borrow'} successful! You received ${borrowAmount} USDC against ${depositedNFTs.length} NFTs as collateral.`)
    } catch (error) {
      console.error('Borrow failed:', error)
      addTransaction({
        type: 'borrow',
        amount: borrowAmount,
        token: 'USDC',
        status: 'failed',
        description: `Borrow failed: ${error}`
      })
      alert('❌ Borrow failed. Please try again.')
    }
  }

  if (!canBorrow) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Borrow USDC</h2>
          <p className="text-gray-600 mb-6">
            Borrow stablecoins using your deposited NFTs as collateral
          </p>
          <div className="bg-yellow-50 p-6 rounded-lg">
            <p className="text-yellow-800 text-lg font-medium mb-2">
              🚫 No Collateral Available
            </p>
            <p className="text-yellow-700">
              You need to deposit NFTs as collateral before you can borrow USDC.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Borrow USDC</h2>
        <p className="text-gray-600 mb-6">
          Borrow stablecoins using your deposited NFTs as collateral
        </p>
      </div>

      {/* Collateral Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Collateral</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Deposited NFTs</p>
            <p className="text-2xl font-bold text-blue-600">{borrowData.collateralNFTs.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Value</p>
            <p className="text-2xl font-bold text-green-600">${borrowData.totalCollateralValue.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Weighted LTV</p>
            <p className="text-2xl font-bold text-purple-600">{weightedLTV.toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Max Borrow</p>
            <p className="text-2xl font-bold text-orange-600">${borrowData.maxBorrowAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* NFT List */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Collateral NFTs:</p>
          <div className="flex flex-wrap gap-2">
            {borrowData.collateralNFTs.map((nftName, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {nftName}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Borrow Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Borrow Details</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Borrow Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Borrow Amount (USDC)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                id="amount"
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 1, message: 'Minimum borrow is 1 USDC' },
                  max: { value: borrowData.availableToBorrow, message: 'Amount exceeds available limit' }
                })}
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(Number(e.target.value))}
                className="block w-full pr-12 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter amount"
                step="0.01"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">USDC</span>
              </div>
            </div>
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}

            <div className="mt-2 text-sm text-gray-600">
              Available: ${borrowData.availableToBorrow.toLocaleString()} USDC
              {borrowData.currentBorrowed > 0 && (
                <span className="block">Current debt: ${borrowData.currentBorrowed.toLocaleString()} USDC</span>
              )}
            </div>
          </div>

          {/* Borrow Summary */}
          {borrowAmount > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 className="font-medium text-gray-900">Borrow Summary</h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Borrow Amount:</span>
                  <span className="font-medium">${borrowAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Origination Fee (0.5%):</span>
                  <span className="font-medium">${borrowData.originationFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Yield Share (20%):</span>
                  <span className="font-medium">{borrowData.yieldShare}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">You Receive:</span>
                  <span className="font-bold text-green-600">${(borrowAmount - borrowData.originationFee).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Health Factor:</span>
                  <span className={`font-medium ${
                    borrowData.totalCollateralValue > borrowAmount ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(borrowData.totalCollateralValue / borrowAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Checkbox */}
          <div className="flex items-center">
            <input
              id="confirmBorrow"
              type="checkbox"
              {...register('confirmBorrow', { required: 'Please confirm to proceed' })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="confirmBorrow" className="ml-2 block text-sm text-gray-900">
              I understand that borrowing creates a debt obligation against my deposited NFTs
            </label>
          </div>
          {errors.confirmBorrow && <p className="text-sm text-red-600">{errors.confirmBorrow.message}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={borrowAmount <= 0 || borrowAmount > borrowData.availableToBorrow}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {borrowAmount > 0 ? `Borrow ${borrowAmount} USDC` : 'Enter Borrow Amount'}
          </button>
        </form>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-blue-900 mb-2">How Borrowing Works</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Your deposited NFTs serve as collateral for borrowing</li>
          <li>• You can borrow up to your collateral value × weighted LTV</li>
          <li>• 0.5% origination fee is charged on borrow amount</li>
          <li>• 20% of NFT yield goes to protocol lenders</li>
          <li>• NFT yield automatically helps repay your debt</li>
        </ul>
      </div>
    </div>
  )
}

export default BorrowInterface