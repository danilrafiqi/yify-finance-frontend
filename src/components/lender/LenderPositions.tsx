import React, { useState } from 'react'
import { useTransactionStore } from '../../stores/transactionStore'
import { useWalletStore } from '../../stores/walletStore'

const LenderPositions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions')
  const { getRecentTransactions } = useTransactionStore()
  const { balance } = useWalletStore()

  // Mock lender positions data
  const lenderPositions = [
    {
      id: 'pos-usdc-1',
      asset: 'USDC',
      depositedAmount: 50000,
      currentValue: 54250,
      apy: 8.5,
      interestEarned: 4250,
      depositDate: '2024-10-15',
      status: 'active' as const,
      monthlyInterest: 358.33
    },
    {
      id: 'pos-usdt-1',
      asset: 'USDT',
      depositedAmount: 30000,
      currentValue: 32050,
      apy: 8.2,
      interestEarned: 2050,
      depositDate: '2024-10-20',
      status: 'active' as const,
      monthlyInterest: 205
    },
    {
      id: 'pos-dai-1',
      asset: 'DAI',
      depositedAmount: 25000,
      currentValue: 26300,
      apy: 7.9,
      interestEarned: 1300,
      depositDate: '2024-10-22',
      status: 'active' as const,
      monthlyInterest: 164.58
    },
    {
      id: 'pos-aero-1',
      asset: 'AERO',
      depositedAmount: 20500,
      currentValue: 24850,
      apy: 12.3,
      interestEarned: 4350,
      depositDate: '2024-10-10',
      status: 'active' as const,
      monthlyInterest: 210.63
    }
  ]

  const transactions = getRecentTransactions(20)
  const filteredTransactions = transactions.filter(
    tx => tx.type === 'deposit' || tx.type === 'withdraw'
  )

  const totalDeposited = lenderPositions.reduce((sum, pos) => sum + pos.depositedAmount, 0)
  const totalValue = lenderPositions.reduce((sum, pos) => sum + pos.currentValue, 0)
  const totalInterestEarned = lenderPositions.reduce((sum, pos) => sum + pos.interestEarned, 0)
  const monthlyEarnings = lenderPositions.reduce((sum, pos) => sum + pos.monthlyInterest, 0)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Lending Positions</h2>
        <p className="text-gray-600 mb-6">
          Manage your lending positions and view your earnings
        </p>
      </div>

      {/* Portfolio Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Portfolio Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Total Deposited</p>
            <p className="text-2xl font-bold text-blue-800">${totalDeposited.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Current Value</p>
            <p className="text-2xl font-bold text-green-800">${totalValue.toLocaleString()}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600">Interest Earned</p>
            <p className="text-2xl font-bold text-purple-800">${totalInterestEarned.toLocaleString()}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-orange-600">Monthly Earnings</p>
            <p className="text-2xl font-bold text-orange-800">${monthlyEarnings.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b flex">
          <button
            onClick={() => setActiveTab('positions')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors border-b-2 ${
              activeTab === 'positions'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Active Positions ({lenderPositions.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors border-b-2 ${
              activeTab === 'history'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Transaction History ({filteredTransactions.length})
          </button>
        </div>

        {/* Active Positions Tab */}
        {activeTab === 'positions' && (
          <div className="p-6">
            <div className="space-y-4">
              {lenderPositions.map((position) => (
                <div key={position.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {position.asset[0]}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{position.asset}</h4>
                        <p className="text-sm text-gray-600">Deposited on {position.depositDate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">{position.apy}% APY</div>
                      <div className="text-xs text-gray-600">{position.status}</div>
                    </div>
                  </div>

                  {/* Position Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-600">Deposited</p>
                      <p className="font-semibold text-gray-900">${position.depositedAmount.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-600">Current Value</p>
                      <p className="font-semibold text-gray-900">${position.currentValue.toLocaleString()}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-xs text-green-600">Interest Earned</p>
                      <p className="font-semibold text-green-700">${position.interestEarned.toLocaleString()}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-xs text-blue-600">Monthly Interest</p>
                      <p className="font-semibold text-blue-700">${position.monthlyInterest.toFixed(2)}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <p className="text-xs text-purple-600">Profit %</p>
                      <p className="font-semibold text-purple-700">{((position.interestEarned / position.depositedAmount) * 100).toFixed(2)}%</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-2 mt-4">
                    <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                      View Details
                    </button>
                    <button className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                      Withdraw
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transaction History Tab */}
        {activeTab === 'history' && (
          <div className="p-6">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No transactions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Asset</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx) => (
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
                        <td className="px-4 py-3 font-medium text-gray-900">{tx.token}</td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
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
        )}
      </div>

      {/* Info Section */}
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <h3 className="text-lg font-medium text-green-900 mb-2">Position Management</h3>
        <ul className="text-green-800 text-sm space-y-1">
          <li>• All positions are liquid - withdraw at any time</li>
          <li>• Interest accrues continuously and is added daily</li>
          <li>• Your positions are secured by smart contracts</li>
          <li>• Fee: 0.5% - 1% deducted from interest earned</li>
          <li>• Borrowers use your funds with NFT collateral</li>
        </ul>
      </div>
    </div>
  )
}

export default LenderPositions
