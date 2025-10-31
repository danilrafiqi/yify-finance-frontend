import React, { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useWalletStore } from '../../stores/walletStore'
import { useTransactionStore } from '../../stores/transactionStore'

interface DepositFormData {
  amount: number
  confirmDeposit: boolean
}

const LenderDeposit: React.FC = () => {
  const [depositAmount, setDepositAmount] = useState<number>(0)
  const [selectedPool, setSelectedPool] = useState<string>('usdc-pool')
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<DepositFormData>()

  const { balance, updateBalance } = useWalletStore()
  const { addTransaction } = useTransactionStore()

  // Lending pools
  const lendingPools = [
    { id: 'usdc-pool', symbol: 'USDC', apy: 8.5 },
    { id: 'usdt-pool', symbol: 'USDT', apy: 8.2 },
    { id: 'dai-pool', symbol: 'DAI', apy: 7.9 },
    { id: 'aero-pool', symbol: 'AERO', apy: 12.3 }
  ]

  const selectedPoolData = lendingPools.find(p => p.id === selectedPool) || lendingPools[0]

  const depositData = useMemo(() => {
    return {
      selectedPool: selectedPoolData.symbol,
      depositAmount,
      interestEarned: (depositAmount * selectedPoolData.apy) / 100 / 12, // Monthly interest
      totalAfter1Year: depositAmount * (1 + selectedPoolData.apy / 100),
      maxDeposit: balance
    }
  }, [depositAmount, selectedPoolData, balance])

  const onSubmit = async (data: DepositFormData) => {
    if (depositAmount <= 0) {
      alert('❌ Please enter a valid deposit amount.')
      return
    }

    if (depositAmount > balance) {
      alert('❌ Insufficient balance. Please check your wallet.')
      return
    }

    if (!data.confirmDeposit) {
      alert('❌ Please confirm the deposit.')
      return
    }

    try {
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update wallet balance
      updateBalance(-depositAmount)

      // Add transaction record
      addTransaction({
        type: 'deposit',
        amount: depositAmount,
        token: selectedPoolData.symbol,
        status: 'confirmed',
        description: `Deposited ${depositAmount} ${selectedPoolData.symbol} into lending pool at ${selectedPoolData.apy}% APY`
      })

      // Reset form
      setDepositAmount(0)
      setValue('amount', 0)
      setValue('confirmDeposit', false)

      alert(`✅ Deposit successful! You deposited ${depositAmount} ${selectedPoolData.symbol} and will earn ~${depositData.interestEarned.toFixed(2)} ${selectedPoolData.symbol} per month.`)
    } catch (error) {
      console.error('Deposit failed:', error)
      addTransaction({
        type: 'deposit',
        amount: depositAmount,
        token: selectedPoolData.symbol,
        status: 'failed',
        description: `Deposit failed: ${error}`
      })
      alert('❌ Deposit failed. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Supply Liquidity</h2>
        <p className="text-gray-600 mb-6">
          Deposit your assets into lending pools to earn interest
        </p>
      </div>

      {/* Wallet Balance Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Wallet</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Available Balance</p>
            <p className="text-2xl font-bold text-green-600">${balance.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Deposited</p>
            <p className="text-2xl font-bold text-blue-600">$125,500</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Interest Earned</p>
            <p className="text-2xl font-bold text-purple-600">$8,450</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Avg APY</p>
            <p className="text-2xl font-bold text-orange-600">8.8%</p>
          </div>
        </div>
      </div>

      {/* Deposit Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Deposit Details</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Pool Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Asset Pool
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {lendingPools.map((pool) => (
                <button
                  key={pool.id}
                  type="button"
                  onClick={() => setSelectedPool(pool.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedPool === pool.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{pool.symbol}</div>
                  <div className="text-xs text-gray-600">{pool.apy}% APY</div>
                </button>
              ))}
            </div>
          </div>

          {/* Deposit Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Deposit Amount ({selectedPoolData.symbol})
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                id="amount"
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 1, message: 'Minimum deposit is 1' },
                  max: { value: depositData.maxDeposit, message: 'Amount exceeds your balance' }
                })}
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="block w-full pr-12 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter amount"
                step="0.01"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">{selectedPoolData.symbol}</span>
              </div>
            </div>
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}

            <div className="mt-2 flex justify-between text-sm text-gray-600">
              <span>Available: ${depositData.maxDeposit.toLocaleString()}</span>
              <button
                type="button"
                onClick={() => {
                  setDepositAmount(balance)
                  setValue('amount', balance)
                }}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Max
              </button>
            </div>
          </div>

          {/* Deposit Summary */}
          {depositAmount > 0 && (
            <div className="bg-green-50 p-4 rounded-lg space-y-3">
              <h4 className="font-medium text-gray-900">Supply Summary</h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Deposit Amount:</span>
                  <span className="font-medium">${depositAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">APY:</span>
                  <span className="font-medium text-green-600">{selectedPoolData.apy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Est. Monthly Interest:</span>
                  <span className="font-medium text-green-600">~${depositData.interestEarned.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Est. After 1 Year:</span>
                  <span className="font-bold text-green-700">${depositData.totalAfter1Year.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Checkbox */}
          <div className="flex items-start">
            <input
              id="confirmDeposit"
              type="checkbox"
              {...register('confirmDeposit', { required: 'Please confirm to proceed' })}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
            />
            <label htmlFor="confirmDeposit" className="ml-2 block text-sm text-gray-900">
              I understand that my deposited assets will be used for lending and I can withdraw them at any time
            </label>
          </div>
          {errors.confirmDeposit && <p className="text-sm text-red-600">{errors.confirmDeposit.message}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={depositAmount <= 0 || depositAmount > balance}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {depositAmount > 0 ? `Deposit ${depositAmount} ${selectedPoolData.symbol}` : 'Enter Deposit Amount'}
          </button>
        </form>
      </div>

      {/* Info Section */}
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <h3 className="text-lg font-medium text-green-900 mb-2">How Lending Works</h3>
        <ul className="text-green-800 text-sm space-y-1">
          <li>• Your deposited assets are used to provide loans to borrowers</li>
          <li>• You earn interest from borrowing fees (APY varies by pool)</li>
          <li>• Your funds are liquid - withdraw at any time</li>
          <li>• Interest compounds automatically</li>
          <li>• Smart contract manages all operations securely</li>
        </ul>
      </div>
    </div>
  )
}

export default LenderDeposit
