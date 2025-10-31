import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { usePositionStore } from '../stores/positionStore'
import { useNFTStore } from '../stores/nftStore'
import { useTransactionStore } from '../stores/transactionStore'
import { useWalletStore } from '../stores/walletStore'

interface PositionAction {
  type: 'add_collateral' | 'repay_partial' | 'withdraw_collateral' | 'close_position'
  amount?: number
}

const PositionManagement: React.FC = () => {
  const [selectedAction, setSelectedAction] = useState<PositionAction['type']>('add_collateral')
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<PositionAction>()

  const { positions, updatePositionBorrow, repayPosition, closePosition } = usePositionStore()
  const { getNFTsByPosition, withdrawNFTs } = useNFTStore()
  const { addTransaction } = useTransactionStore()
  const { updateBalance } = useWalletStore()

  // Get borrow positions (borrow-*) for management
  const borrowPositions = positions.filter(pos => pos.id.startsWith('borrow-') && pos.status === 'active')
  const activeBorrowPosition = borrowPositions[0] // Get first borrow position for management

  const position = activeBorrowPosition ? (() => {
    const collateralNFTs = getNFTsByPosition(activeBorrowPosition.id)
    const totalCollateralValue = collateralNFTs.reduce((sum, nft) => sum + nft.floorPrice, 0)

    // For borrow positions, use the combined weighted LTV
    const { getWeightedLTV } = usePositionStore()
    const weightedLTV = getWeightedLTV()

    const maxBorrowLimit = totalCollateralValue * (weightedLTV / 100)
    const availableToBorrow = Math.max(0, maxBorrowLimit - activeBorrowPosition.borrowedAmount)
    const minCollateralRequired = activeBorrowPosition.borrowedAmount / (weightedLTV / 100)
    const maxCollateralWithdraw = Math.max(0, totalCollateralValue - minCollateralRequired)

    return {
      id: activeBorrowPosition.id,
      collateralNFTs: collateralNFTs.map(nft => nft.name),
      totalCollateralValue,
      borrowedAmount: activeBorrowPosition.borrowedAmount,
      maxBorrowLimit,
      availableToBorrow,
      weightedLTV,
      canWithdrawCollateral: maxCollateralWithdraw > 0,
      minCollateralRequired,
      maxCollateralWithdraw
    }
  })() : null

  const getHealthFactorColor = (factor: number) => {
    if (factor >= 2.0) return 'text-green-600'
    if (factor >= 1.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const onSubmit = async (data: PositionAction) => {
    if (!position) {
      alert('❌ No active position found.')
      return
    }

    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000))

      switch (data.type) {
        case 'add_collateral':
          // This would open NFT selection modal
          alert('✅ Add collateral functionality would open NFT selection modal')
          break

        case 'repay_partial':
          if (!data.amount) break
          repayPosition(position.id, data.amount)
          updateBalance(-data.amount)
          addTransaction({
            type: 'repay',
            amount: data.amount,
            token: 'USDC',
            positionId: position.id,
            status: 'confirmed',
            description: `Partial repayment of ${data.amount} USDC`
          })
          alert(`✅ Successfully repaid ${data.amount.toLocaleString()} USDC!`)
          break

        case 'withdraw_collateral':
          // This would open NFT withdrawal modal
          alert('✅ Withdraw collateral functionality would open NFT selection modal')
          break

        case 'close_position':
          repayPosition(position.id, position.borrowedAmount)
          updateBalance(-position.borrowedAmount)
          closePosition(position.id)
          withdrawNFTs(position.collateralNFTs.map(name => {
            // Find NFT by name (this is simplified)
            const nft = getNFTsByPosition(position.id).find(n => n.name === name)
            return nft?.id || ''
          }).filter(id => id))

          addTransaction({
            type: 'repay',
            amount: position.borrowedAmount,
            token: 'USDC',
            positionId: position.id,
            status: 'confirmed',
            description: `Closed position - full repayment of ${position.borrowedAmount} USDC`
          })
          alert(`✅ Position closed! NFTs returned to wallet.`)
          break
      }
    } catch (error) {
      console.error('Position management failed:', error)
      alert('❌ Operation failed. Please try again.')
    }
  }

  const renderActionForm = () => {
    switch (selectedAction) {
      case 'add_collateral':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Add more veNFT or NFT RWA to increase your borrowing limit and improve position health.
            </p>
            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700">
              Select Additional NFTs
            </button>
          </div>
        )

      case 'repay_partial':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repay Amount (USDC)
              </label>
              <input
                type="number"
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 1, message: 'Minimum amount is 1 USDC' },
                  max: { value: position.borrowedAmount, message: 'Cannot repay more than borrowed' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter repay amount"
              />
              {errors.amount && (
                <p className="text-red-600 text-sm mt-1">{errors.amount.message}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setValue('amount', position.borrowedAmount)}
                className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded"
              >
                Repay All
              </button>
              <button
                type="button"
                onClick={() => setValue('amount', Math.floor(position.borrowedAmount / 2))}
                className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded"
              >
                Half
              </button>
            </div>
          </div>
        )

      case 'withdraw_collateral':
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-yellow-800 text-sm">
                ⚠️ Withdrawing collateral will reduce your borrowing limit and may affect position health.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdraw Amount ($)
              </label>
              <input
                type="number"
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 1, message: 'Minimum amount is $1' },
                  max: { value: position.maxCollateralWithdraw, message: 'Amount exceeds safe withdrawal limit' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter withdraw amount"
              />
              {errors.amount && (
                <p className="text-red-600 text-sm mt-1">{errors.amount.message}</p>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Max safe withdrawal: ${position.maxCollateralWithdraw}
            </p>
          </div>
        )

      case 'close_position':
        return (
          <div className="space-y-4">
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-red-800 text-sm">
                🚨 This will repay your full debt (${position.borrowedAmount}) and unlock your NFTs.
                Make sure you have enough USDC in your wallet.
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Full repayment amount:</strong> ${position.borrowedAmount} USDC
              </p>
              <div className="text-sm text-green-700 mt-1">
                <strong>NFT to be unlocked:</strong>
                <div className="text-xs mt-1">• {position.collateralNFTs?.[0] || 'NFT'}</div>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-blue-800 text-sm">
                💡 <strong>After closing:</strong> Your NFTs will be returned to your wallet.
                You can deposit them again for new loans or use them elsewhere.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!position) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Manage Position</h2>
          <div className="text-center py-12">
            <p className="text-gray-500">No active positions found.</p>
            <p className="text-sm text-gray-400 mt-2">Deposit NFTs first to create a position to manage.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Manage Position</h2>

        {/* Position Overview */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Multi-Asset Position</h3>

          {/* Collateral NFTs */}
          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-2">Collateral NFTs:</p>
            <div className="space-y-2">
              {position.collateralNFTs.map((nft, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                  <span className="text-sm font-medium text-gray-900">{nft}</span>
                  <button
                    onClick={() => {
                      // Find NFT by name and withdraw it
                      const nftToWithdraw = getNFTsByPosition(position.id).find(n => n.name === nft)
                      if (nftToWithdraw) {
                        withdrawNFTs([nftToWithdraw.id])
                        alert(`Withdrew ${nft} from collateral`)
                      }
                    }}
                    className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Withdraw
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Total Collateral Value</p>
              <p className="font-medium">${position.totalCollateralValue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Borrowed Amount</p>
              <p className="font-medium">${position.borrowedAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Weighted LTV</p>
              <p className="font-medium">{position.weightedLTV.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-gray-600">Available to Borrow</p>
              <p className="font-medium text-green-600">${position.availableToBorrow.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-3 text-xs text-blue-600">
            <p>🏦 Aave-style lending: Multiple NFTs combined as single collateral position</p>
          </div>
        </div>

        {/* Action Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Choose Action</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: 'add_collateral', label: 'Add More Collateral', desc: 'Increase borrowing limit', color: 'blue' },
              { id: 'repay_partial', label: 'Partial Repayment', desc: 'Pay down some debt', color: 'green' },
              { id: 'withdraw_collateral', label: 'Withdraw Collateral', desc: 'Reduce collateral amount', color: 'yellow' },
              { id: 'close_position', label: 'Close Position', desc: 'Repay full amount & unlock NFT', color: 'red' }
            ].map((action) => (
              <button
                key={action.id}
                onClick={() => setSelectedAction(action.id as PositionAction['type'])}
                className={`p-4 border rounded-lg text-left hover:shadow-md transition-shadow ${
                  selectedAction === action.id
                    ? `border-${action.color}-500 bg-${action.color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h4 className="font-medium text-gray-900">{action.label}</h4>
                <p className="text-sm text-gray-600">{action.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Action Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {renderActionForm()}

          {/* Confirm Action */}
          <div className="flex items-start space-x-3 pt-4 border-t">
            <input
              type="checkbox"
              id="confirmAction"
              {...register('confirmAction', { required: 'You must confirm this action' })}
              className="mt-1 h-4 w-4 text-blue-600"
            />
            <label htmlFor="confirmAction" className="text-sm text-gray-700">
              I understand the risks and consequences of this action on my position.
            </label>
          </div>
          {errors.confirmAction && (
            <p className="text-red-600 text-sm">{errors.confirmAction.message}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700"
          >
            Execute {selectedAction.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        </form>
      </div>
    </div>
  )
}

export default PositionManagement
