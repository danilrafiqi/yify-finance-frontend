import React, { useState } from 'react'
import { useWalletStore } from '../stores/walletStore'
import { useTransactionStore } from '../stores/transactionStore'
import { useForm } from 'react-hook-form'

type ActiveTab = 'markets' | 'deposit' | 'positions' | 'withdraw'

interface DepositFormData {
  amount: number
  confirmDeposit: boolean
}

interface WithdrawFormData {
  amount: number
  confirmWithdraw: boolean
}

const LenderMenu: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('markets')
  const [depositAmount, setDepositAmount] = useState<number>(0)
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0)

  const { register: registerDeposit, handleSubmit: handleSubmitDeposit, formState: { errors: errorsDeposit }, setValue: setValueDeposit } = useForm<DepositFormData>()
  const { register: registerWithdraw, handleSubmit: handleSubmitWithdraw, formState: { errors: errorsWithdraw }, setValue: setValueWithdraw } = useForm<WithdrawFormData>()

  const { balance = 0, updateBalance } = useWalletStore()
  const { addTransaction, getRecentTransactions } = useTransactionStore()

  // Lending pool - only USDC
  const lendingPools = [
    { id: 'usdc-pool', symbol: 'USDC', apy: 8.5, totalDeposits: 1250000, utilization: 75, icon: '💰' }
  ]

  // Lender position - single pool
  const lenderPositions = [
    { id: 'pos-usdc-main', asset: 'USDC', depositedAmount: 125500, currentValue: 136087.5, apy: 8.5, interestEarned: 10587.5, depositDate: '2024-10-15', monthlyInterest: 891.46 }
  ]

  const selectedPoolDataDeposit = lendingPools[0] // Only USDC pool
  const selectedPosWithdraw = lenderPositions[0] // Only one position
  const transactions = getRecentTransactions(20) || []
  const filteredTransactions = (transactions || []).filter(tx => tx.type === 'deposit' || tx.type === 'withdraw')

  const totalDeposited = lenderPositions.reduce((sum, pos) => sum + (pos.depositedAmount || 0), 0)
  const totalValue = lenderPositions.reduce((sum, pos) => sum + (pos.currentValue || 0), 0)
  const totalInterestEarned = lenderPositions.reduce((sum, pos) => sum + (pos.interestEarned || 0), 0)
  const monthlyEarnings = lenderPositions.reduce((sum, pos) => sum + (pos.monthlyInterest || 0), 0)

  // Deposit handler
  const onDepositSubmit = async (data: DepositFormData) => {
    if (depositAmount <= 0 || !data.confirmDeposit) {
      alert('❌ Please enter valid amount and confirm.')
      return
    }
    if (depositAmount > balance) {
      alert('❌ Insufficient balance.')
      return
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      updateBalance(-depositAmount)
      addTransaction({
        type: 'deposit',
        amount: depositAmount,
        token: selectedPoolDataDeposit.symbol,
        status: 'confirmed',
        description: `Deposited ${depositAmount} ${selectedPoolDataDeposit.symbol}`
      })
      setDepositAmount(0)
      setValueDeposit('amount', 0)
      setValueDeposit('confirmDeposit', false)
      alert(`✅ Deposit successful! Your ${depositAmount} USDC is now earning 8.5% APY from borrowers.`)
    } catch (error) {
      alert('❌ Deposit failed.')
    }
  }

  // Withdraw handler
  const onWithdrawSubmit = async (data: WithdrawFormData) => {
    if (withdrawAmount <= 0 || !data.confirmWithdraw) {
      alert('❌ Please enter valid amount and confirm.')
      return
    }
    if (withdrawAmount > selectedPosWithdraw.currentValue) {
      alert('❌ Amount exceeds available balance.')
      return
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const netAmount = withdrawAmount * 0.99
      updateBalance(netAmount)
      addTransaction({
        type: 'withdraw',
        amount: withdrawAmount,
        token: selectedPosWithdraw.asset,
        status: 'confirmed',
        description: `Withdrawn ${withdrawAmount} ${selectedPosWithdraw.asset}`
      })
      setWithdrawAmount(0)
      setValueWithdraw('amount', 0)
      setValueWithdraw('confirmWithdraw', false)
      alert(`✅ Withdrawal successful! You received ${(withdrawAmount * 0.99).toFixed(2)} USDC (after 1% withdrawal fee).`)
    } catch (error) {
      alert('❌ Withdrawal failed.')
    }
  }

  const tabItems = [
    { id: 'markets' as const, label: 'Pool Info' },
    { id: 'deposit' as const, label: 'Deposit' },
    { id: 'positions' as const, label: 'My Position' },
    { id: 'withdraw' as const, label: 'Withdraw' }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-6 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🏦 USDC Lending Pool</h1>
            <p className="text-gray-600 mt-1">Deposit USDC to earn interest from borrowers</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Pool TVL</div>
            <div className="text-2xl font-bold text-green-600">$1.25M</div>
            <div className="text-sm text-gray-500 mt-2">Your USDC: ${balance.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">USDC Deposited</p>
          <p className="text-2xl font-bold text-blue-800">${totalDeposited.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-600 font-medium">Current Balance</p>
          <p className="text-2xl font-bold text-green-800">${totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-600 font-medium">Interest Earned</p>
          <p className="text-2xl font-bold text-purple-800">${totalInterestEarned.toLocaleString()}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <p className="text-sm text-orange-600 font-medium">Monthly Interest</p>
          <p className="text-2xl font-bold text-orange-800">${monthlyEarnings.toFixed(2)}</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b overflow-x-auto">
          {tabItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 py-4 px-4 text-center font-medium transition-colors border-b-2 ${
                activeTab === item.id
                  ? 'border-green-500 text-green-600 bg-green-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Pool Info Tab */}
          {activeTab === 'markets' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Pool Information</h2>

              {/* Single USDC Pool */}
              <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">💰</span>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">USDC Lending Pool</h3>
                      <p className="text-sm text-gray-600">Lend USDC and earn interest from borrowers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">8.5%</p>
                    <p className="text-sm text-gray-600">APY</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Deposits</p>
                    <p className="text-xl font-bold text-blue-600">$1.25M</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Utilization</p>
                    <p className="text-xl font-bold text-orange-600">75%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Active Lenders</p>
                    <p className="text-xl font-bold text-purple-600">1,247</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Your USDC</p>
                    <p className="text-xl font-bold text-green-600">${totalDeposited.toLocaleString()}</p>
                  </div>
                </div>

                {/* Utilization Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Pool Utilization</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="h-3 bg-green-500 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('deposit')}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors text-lg"
                >
                  Deposit USDC
                </button>
              </div>

              {/* Pool Info */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">About USDC Lending</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Deposit USDC to earn 8.5% APY from borrowing fees</li>
                  <li>• Borrowers use NFT collateral to borrow your USDC</li>
                  <li>• Your funds are always liquid - withdraw anytime</li>
                  <li>• Interest accrues continuously on your deposit</li>
                  <li>• Smart contract secured on Base network</li>
                </ul>
              </div>
            </div>
          )}

          {/* Deposit Tab */}
          {activeTab === 'deposit' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Deposit USDC</h2>

              {/* Pool Info */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">💰</span>
                    <div>
                      <h4 className="font-semibold text-blue-900">USDC Lending Pool</h4>
                      <p className="text-sm text-blue-600">8.5% APY • Earn from borrowers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-800">$1.25M</p>
                    <p className="text-xs text-blue-600">Pool Size</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitDeposit(onDepositSubmit)} className="space-y-4">
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deposit Amount (USDC)</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      {...registerDeposit('amount', { required: 'Amount required', min: { value: 1, message: 'Min 1' } })}
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter USDC amount"
                      step="0.01"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setDepositAmount(balance)
                        setValueDeposit('amount', balance)
                      }}
                      className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium text-sm"
                    >
                      Max
                    </button>
                  </div>
                  {errorsDeposit.amount && <p className="text-red-600 text-sm mt-1">{errorsDeposit.amount.message}</p>}
                </div>

                {/* Summary */}
                {depositAmount > 0 && selectedPoolDataDeposit && (
                  <div className="bg-green-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Monthly Interest:</span>
                      <span className="font-medium text-green-600">${((depositAmount * (selectedPoolDataDeposit.apy || 0)) / 100 / 12).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>1-Year Total:</span>
                      <span className="font-medium text-green-700">${(depositAmount * (1 + (selectedPoolDataDeposit.apy || 0) / 100)).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Confirmation */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="confirmDeposit"
                    {...registerDeposit('confirmDeposit')}
                    className="h-4 w-4"
                  />
                  <label htmlFor="confirmDeposit" className="text-sm text-gray-700">I understand my USDC will be lent to borrowers and I'll earn interest</label>
                </div>

                <button
                  type="submit"
                  disabled={depositAmount <= 0}
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  Deposit {depositAmount} USDC
                </button>
              </form>
            </div>
          )}

          {/* Positions Tab */}
          {activeTab === 'positions' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your USDC Position</h2>

              {/* Single Position Display */}
              <div className="border rounded-lg p-6 bg-gradient-to-r from-green-50 to-blue-50">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-4xl">💰</span>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">USDC Lending Position</h3>
                      <p className="text-gray-600">Earning interest from borrowers since October 15, 2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">8.5%</p>
                    <p className="text-sm text-gray-600">Annual APY</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600">USDC Deposited</p>
                    <p className="text-2xl font-bold text-blue-600">${totalDeposited.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600">Current Value</p>
                    <p className="text-2xl font-bold text-green-600">${totalValue.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600">Interest Earned</p>
                    <p className="text-2xl font-bold text-purple-600">${totalInterestEarned.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600">Monthly Interest</p>
                    <p className="text-2xl font-bold text-orange-600">${monthlyEarnings.toFixed(2)}</p>
                  </div>
                </div>

                {/* Performance Chart Placeholder */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Performance Overview</h4>
                  <div className="h-32 bg-gradient-to-r from-green-100 to-blue-100 rounded flex items-center justify-center">
                    <span className="text-gray-500">📈 Performance chart coming soon</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setActiveTab('deposit')}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Deposit More USDC
                  </button>
                  <button
                    onClick={() => setActiveTab('withdraw')}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Withdraw USDC
                  </button>
                </div>
              </div>

              {/* Transaction History */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>

                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No transactions yet</p>
                    <button
                      onClick={() => setActiveTab('deposit')}
                      className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
                    >
                      Make Your First USDC Deposit
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Amount</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map(tx => (
                          <tr key={tx.id} className="border-t hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                tx.type === 'deposit'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {tx.type === 'deposit' ? '📥 Deposit' : '📤 Withdraw'}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-medium">
                              {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()} {tx.token}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {new Date(tx.timestamp).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                tx.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : tx.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Withdraw Tab */}
          {activeTab === 'withdraw' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Withdraw USDC</h2>

              {/* Position Info */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">💰</span>
                    <div>
                      <h4 className="font-semibold text-red-900">USDC Lending Position</h4>
                      <p className="text-sm text-red-600">Earning 8.5% APY • Deposited October 15, 2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-800">${totalValue.toLocaleString()}</p>
                    <p className="text-xs text-red-600">Current Value</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-red-600">Originally Deposited</p>
                    <p className="font-semibold text-red-900">${totalDeposited.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-red-600">Interest Earned</p>
                    <p className="font-semibold text-red-900">${totalInterestEarned.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-red-600">Monthly Earnings</p>
                    <p className="font-semibold text-red-900">${monthlyEarnings.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitWithdraw(onWithdrawSubmit)} className="space-y-4">
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Withdrawal Amount (USDC)</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      {...registerWithdraw('amount', { required: 'Amount required' })}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                      className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Enter USDC amount"
                      step="0.01"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setWithdrawAmount(totalValue)
                        setValueWithdraw('amount', totalValue)
                      }}
                      className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium text-sm"
                    >
                      Withdraw All
                    </button>
                  </div>
                </div>

                {/* Summary */}
                {withdrawAmount > 0 && selectedPosWithdraw && (
                  <div className="bg-red-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Withdrawal Amount:</span>
                      <span>${withdrawAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Fee (1%):</span>
                      <span className="text-red-600">-${(withdrawAmount * 0.01).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-sm font-medium">
                      <span>You Receive:</span>
                      <span className="text-red-700">${(withdrawAmount * 0.99).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Confirmation */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="confirmWithdraw"
                    {...registerWithdraw('confirmWithdraw')}
                    className="h-4 w-4"
                  />
                  <label htmlFor="confirmWithdraw" className="text-sm text-gray-700">I understand I'll receive my USDC minus the 1% withdrawal fee</label>
                </div>

                <button
                  type="submit"
                  disabled={withdrawAmount <= 0}
                  className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  Withdraw {withdrawAmount} USDC
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <h3 className="text-lg font-medium text-green-900 mb-2">How USDC Lending Works</h3>
        <ul className="text-green-800 text-sm space-y-1">
          <li>• Deposit your USDC into the lending pool</li>
          <li>• Borrowers use NFT collateral to borrow your USDC</li>
          <li>• You earn 8.5% APY from borrowing fees paid by borrowers</li>
          <li>• Your USDC is always liquid - withdraw anytime with 1% fee</li>
          <li>• Interest accrues continuously and compounds automatically</li>
          <li>• All operations are managed by secure smart contracts</li>
        </ul>
      </div>
    </div>
  )
}

export default LenderMenu
