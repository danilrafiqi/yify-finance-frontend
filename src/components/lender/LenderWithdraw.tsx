import React, { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useWalletStore } from '../../stores/walletStore'
import { useTransactionStore } from '../../stores/transactionStore'

interface WithdrawFormData {
  amount: number
  confirmWithdraw: boolean
}

const LenderWithdraw: React.FC = () => {
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0)
  const [selectedPosition, setSelectedPosition] = useState<string>('pos-usdc-1')
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<WithdrawFormData>()

  const { balance, updateBalance } = useWalletStore()
  const { addTransaction } = useTransactionStore()

  // Mock lender positions
  const positions = [
    { id: 'pos-usdc-1', asset: 'USDC', available: 54250, deposited: 50000, earned: 4250 },
    { id: 'pos-usdt-1', asset: 'USDT', available: 32050, deposited: 30000, earned: 2050 },
    { id: 'pos-dai-1', asset: 'DAI', available: 26300, deposited: 25000, earned: 1300 },
    { id: 'pos-aero-1', asset: 'AERO', available: 24850, deposited: 20500, earned: 4350 }
  ]

  const selectedPos = positions.find(p => p.id === selectedPosition) || positions[0]

  const withdrawData = useMemo(() => {
    return {
      selectedAsset: selectedPos.asset,
      withdrawAmount,
      withdrawFee: withdrawAmount * 0.01, // 1% fee
      netAmount: withdrawAmount - (withdrawAmount * 0.01),
      maxWithdraw: selectedPos.available,
      earnedAmount: selectedPos.earned,
      depositedAmount: selectedPos.deposited
    }
  }, [withdrawAmount, selectedPos])

  const onSubmit = async (data: WithdrawFormData) => {
    if (withdrawAmount <= 0) {
      alert('❌ Please enter a valid withdrawal amount.')
      return
    }

    if (withdrawAmount > withdrawData.maxWithdraw) {
      alert('❌ Withdrawal amount exceeds available balance.')
      return
    }

    if (!data.confirmWithdraw) {
      alert('❌ Please confirm the withdrawal.')
      return
    }

    try {
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update wallet balance
      updateBalance(withdrawData.netAmount)

      // Add transaction record
      addTransaction({
        type: 'withdraw',
        amount: withdrawAmount,
        token: selectedPos.asset,
        status: 'confirmed',
        description: `Withdrawn ${withdrawAmount} ${selectedPos.asset} from lending pool (Net: ${withdrawData.netAmount.toFixed(2)} after 1% fee)`
      })

      // Reset form
      setWithdrawAmount(0)
      setValue('amount', 0)
      setValue('confirmWithdraw', false)

      alert(`✅ Withdrawal successful! You received ${withdrawData.netAmount.toFixed(2)} ${selectedPos.asset} (after 1% fee of ${withdrawData.withdrawFee.toFixed(2)}).`)
    } catch (error) {
      console.error('Withdrawal failed:', error)
      addTransaction({
        type: 'withdraw',
        amount: withdrawAmount,
        token: selectedPos.asset,
        status: 'failed',
        description: `Withdrawal failed: ${error}`
      })
      alert('❌ Withdrawal failed. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Withdraw Funds</h2>
        <p className="text-gray-600 mb-6">
          Withdraw your deposited assets from lending pools at any time
        </p>
      </div>

      {/* Positions Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Lending Positions</h3>
        
        <div className="space-y-3">
          {positions.map((position) => (
            <div
              key={position.id}
              onClick={() => setSelectedPosition(position.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedPosition === position.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {position.asset[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{position.asset}</h4>
                    <p className="text-sm text-gray-600">Deposited: ${position.deposited.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">${position.available.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Available</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Withdrawal Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Withdrawal Details</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Selected Position Info */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Selected Position</p>
                <p className="text-xl font-semibold text-blue-900">{selectedPos.asset}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600">Available Balance</p>
                <p className="text-2xl font-bold text-blue-800">${selectedPos.available.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-blue-600">Originally Deposited</p>
                <p className="font-semibold text-blue-900">${selectedPos.deposited.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600">Interest Earned</p>
                <p className="font-semibold text-blue-900">${selectedPos.earned.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Withdrawal Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Withdrawal Amount ({selectedPos.asset})
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                id="amount"
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 1, message: 'Minimum withdrawal is 1' },
                  max: { value: withdrawData.maxWithdraw, message: 'Amount exceeds available balance' }
                })}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                className="block w-full pr-12 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="Enter amount"
                step="0.01"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">{selectedPos.asset}</span>
              </div>
            </div>
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}

            <div className="mt-2 flex justify-between text-sm text-gray-600">
              <span>Available: ${withdrawData.maxWithdraw.toLocaleString()}</span>
              <button
                type="button"
                onClick={() => {
                  setWithdrawAmount(selectedPos.available)
                  setValue('amount', selectedPos.available)
                }}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Withdraw All
              </button>
            </div>
          </div>

          {/* Withdrawal Summary */}
          {withdrawAmount > 0 && (
            <div className="bg-red-50 p-4 rounded-lg space-y-3">
              <h4 className="font-medium text-gray-900">Withdrawal Summary</h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Withdrawal Amount:</span>
                  <span className="font-medium">${withdrawAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Withdrawal Fee (1%):</span>
                  <span className="font-medium text-red-600">-${withdrawData.withdrawFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-red-200 pt-2 flex justify-between">
                  <span className="text-gray-600">You Receive:</span>
                  <span className="font-bold text-red-700">${withdrawData.netAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded border border-red-200 text-xs text-gray-600">
                <p>💡 Your position in this pool will be reduced. Interest will continue to accrue on remaining balance.</p>
              </div>
            </div>
          )}

          {/* Confirmation Checkbox */}
          <div className="flex items-start">
            <input
              id="confirmWithdraw"
              type="checkbox"
              {...register('confirmWithdraw', { required: 'Please confirm to proceed' })}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-1"
            />
            <label htmlFor="confirmWithdraw" className="ml-2 block text-sm text-gray-900">
              I understand that withdrawing funds will reduce my lending position and future earnings
            </label>
          </div>
          {errors.confirmWithdraw && <p className="text-sm text-red-600">{errors.confirmWithdraw.message}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={withdrawAmount <= 0 || withdrawAmount > withdrawData.maxWithdraw}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {withdrawAmount > 0 ? `Withdraw ${withdrawAmount} ${selectedPos.asset}` : 'Enter Withdrawal Amount'}
          </button>
        </form>
      </div>

      {/* Withdrawal Methods Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-medium text-yellow-900 mb-2">⏱️ Processing Time</h3>
          <ul className="text-yellow-800 text-sm space-y-1">
            <li>• Standard: 1-3 minutes</li>
            <li>• Priority: 30 seconds (2% fee)</li>
            <li>• Instant: Immediate (5% fee)</li>
          </ul>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-medium text-blue-900 mb-2">📋 Fee Structure</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Standard Withdrawal: 1%</li>
            <li>• Early Withdrawal: Additional 2%</li>
            <li>• After 30 days: No early fee</li>
          </ul>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-red-50 p-6 rounded-lg border border-red-200">
        <h3 className="text-lg font-medium text-red-900 mb-2">Withdrawal Information</h3>
        <ul className="text-red-800 text-sm space-y-1">
          <li>• Withdrawals are processed immediately upon confirmation</li>
          <li>• A 1% fee is deducted from withdrawal amount</li>
          <li>• Your funds are returned to your wallet</li>
          <li>• Any pending interest is forfeited on partial withdrawals</li>
          <li>• Full withdrawal closes the position and stops earning interest</li>
        </ul>
      </div>
    </div>
  )
}

export default LenderWithdraw
