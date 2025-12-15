// pages/lender/Dashboard.tsx
// REFACTORED - Menggunakan viewmodel pattern
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Loader2, ArrowDownCircle, ArrowUpCircle, ExternalLink, Minus, TrendingUp, Info } from 'lucide-react'
import { useChainId } from 'wagmi'

import { useDashboardViewModel } from '../viewmodels/dashboard.viewmodel'

const LenderDashboard: React.FC = () => {
  const chainId = useChainId()
  const {
    transactions,
    currentValue,
    totalDeposited,
    totalWithdrawn,
    yieldEarned,
    apr,
    availableLiquidity,
    withdrawAmount,
    setWithdrawAmount,
    withdraw,
    isLoading,
    isLoadingTransactions,
    isWithdrawing,
    ponderError
  } = useDashboardViewModel()

  const [showWithdrawForm, setShowWithdrawForm] = useState(false)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase">Lender Dashboard</h1>
          <p className="font-bold text-gray-600">Monitor your deposits and yield earnings.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowWithdrawForm(!showWithdrawForm)}
            disabled={currentValue === 0 || isWithdrawing}
            className="btn-neo bg-neo-pink text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus size={24} strokeWidth={3} /> Withdraw
          </button>
          <Link to="/lender/deposit" className="btn-secondary flex items-center gap-2">
            <Plus size={24} strokeWidth={3} /> Deposit USDC
          </Link>
        </div>
      </div>

      {/* Withdraw Form */}
      {showWithdrawForm && (
        <div className="card-neo bg-white border-4 border-black p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-black uppercase">Withdraw USDC</h3>
            <button
              onClick={() => {
                setShowWithdrawForm(false)
                setWithdrawAmount(0)
              }}
              className="text-gray-500 hover:text-black font-bold"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block font-bold uppercase text-sm mb-2">Amount to Withdraw</label>
              <div className="relative">
                <input
                  type="number"
                  value={withdrawAmount || ''}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  max={currentValue}
                  min={0}
                  step="0.01"
                  className="input-neo text-2xl pr-24"
                  placeholder="0.00"
                />
                <button
                  onClick={() => setWithdrawAmount(currentValue)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold bg-black text-white px-2 py-1 uppercase hover:bg-gray-800"
                >
                  Max
                </button>
              </div>
            </div>

            <div className="bg-gray-100 p-3 border-2 border-black space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-bold">Available Balance:</span>
                <span className="font-black">${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-bold">Pool Liquidity:</span>
                <span className={`font-black ${availableLiquidity < withdrawAmount ? 'text-red-600' : 'text-green-600'}`}>
                  ${availableLiquidity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {availableLiquidity < withdrawAmount && (
                <div className="flex items-center gap-2 text-xs text-red-600 mt-2">
                  <Info size={14} />
                  <span>Insufficient pool liquidity. You can withdraw up to ${availableLiquidity.toFixed(2)}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => withdraw(withdrawAmount)}
              disabled={!withdrawAmount || withdrawAmount <= 0 || withdrawAmount > currentValue || withdrawAmount > availableLiquidity || isWithdrawing}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isWithdrawing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Withdrawing...
                </>
              ) : (
                <>
                  <Minus size={20} />
                  Withdraw ${withdrawAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="card-neo bg-black text-white">
          <h3 className="text-lg font-bold uppercase text-gray-400 mb-2">Current Balance</h3>
          <p className="text-4xl font-black text-neo-white flex items-center gap-2">
            ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            {isLoading && <Loader2 className="animate-spin" size={20} />}
          </p>
          <p className="text-sm text-gray-400 mt-1">Real-time yUSDC value</p>
        </div>

        <div className="card-neo bg-neo-blue text-white">
          <h3 className="text-lg font-bold uppercase text-blue-200 mb-2">Total Deposited</h3>
          <p className="text-4xl font-black">
            ${totalDeposited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-blue-200 mt-1">Lifetime deposits</p>
        </div>

        <div className="card-neo bg-neo-pink text-white">
          <h3 className="text-lg font-bold uppercase text-pink-200 mb-2">Total Withdrawn</h3>
          <p className="text-4xl font-black">
            ${totalWithdrawn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-pink-200 mt-1">Lifetime withdrawals</p>
        </div>

        <div className="card-neo bg-neo-green text-black">
          <h3 className="text-lg font-bold uppercase text-green-800 mb-2 flex items-center gap-2">
            <TrendingUp size={18} />
            Yield Earned
          </h3>
          <p className="text-4xl font-black">
            ${yieldEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-green-700 mt-1">Total yield generated</p>
        </div>

        <div className="card-neo bg-white">
          <h3 className="text-lg font-bold uppercase text-gray-500 mb-2">Current APR</h3>
          <p className="text-4xl font-black text-neo-green">~{apr}%</p>
          <p className="text-sm text-gray-500 mt-1">Estimated yield</p>
        </div>
      </div>

      {/* Ponder Status */}
      {ponderError && (
        <div className="bg-yellow-50 border-4 border-yellow-400 p-4">
          <p className="font-bold text-yellow-800">⚠️ Indexer Unavailable</p>
          <p className="text-sm text-yellow-700">
            Historical data (Total Deposited/Withdrawn) may not be accurate. Current balance is still live from the blockchain.
          </p>
        </div>
      )}

      <h2 className="text-2xl font-black uppercase mt-8 mb-4">Recent Activities</h2>

      {/* Transaction History */}
      {isLoadingTransactions ? (
        <div className="bg-white border-4 border-black p-8 text-center">
          <Loader2 className="animate-spin mx-auto mb-2" size={32} />
          <p className="font-bold text-gray-600">Loading transaction history...</p>
        </div>
      ) : transactions.length > 0 ? (
        <div className="bg-white border-4 border-black overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-black uppercase">Type</th>
                  <th className="px-6 py-4 text-left font-black uppercase">Amount</th>
                  <th className="px-6 py-4 text-left font-black uppercase">Date</th>
                  <th className="px-6 py-4 text-left font-black uppercase">Transaction</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={tx.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {tx.type === 'deposit' ? (
                          <ArrowDownCircle className="text-neo-green" size={20} strokeWidth={3} />
                        ) : (
                          <ArrowUpCircle className="text-neo-pink" size={20} strokeWidth={3} />
                        )}
                        <span className="font-bold uppercase">{tx.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold">
                      ${tx.formattedAmount.toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(Number(tx.timestamp) * 1000).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {chainId === 31337 ? (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(tx.txHash)
                            alert('Transaction hash copied!')
                          }}
                          className="text-neo-blue hover:underline font-bold"
                        >
                          Copy Hash
                        </button>
                      ) : (
                        <a
                          href={`https://sepolia-blockscout.lisk.com/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-neo-blue hover:underline font-bold"
                        >
                          View <ExternalLink size={16} />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border-4 border-black p-8 text-center text-gray-500">
          <p className="font-bold text-lg">No transactions yet</p>
          <p className="text-sm">Make your first deposit to get started!</p>
        </div>
      )}
    </div>
  )
}

export default LenderDashboard
