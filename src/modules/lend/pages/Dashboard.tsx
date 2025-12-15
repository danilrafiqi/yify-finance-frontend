// pages/lender/Dashboard.tsx
// REFACTORED - Menggunakan viewmodel pattern
import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Loader2, ArrowDownCircle, ArrowUpCircle, ExternalLink } from 'lucide-react'
import { formatUnits } from 'viem'
import { useChainId } from 'wagmi'

import { useDashboardViewModel } from '../viewmodels/dashboard.viewmodel'

const LenderDashboard: React.FC = () => {
  const chainId = useChainId()
  const {
    transactions,
    currentValue,
    totalDeposited,
    totalWithdrawn,
    apr,
    isLoading,
    isLoadingTransactions,
    ponderError
  } = useDashboardViewModel()

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase">Lender Dashboard</h1>
          <p className="font-bold text-gray-600">Monitor your deposits and yield earnings.</p>
        </div>
        <Link to="/lender/deposit" className="btn-secondary flex items-center gap-2">
          <Plus size={24} strokeWidth={3} /> Deposit USDC
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      ${parseFloat(formatUnits(tx.assets, 6)).toLocaleString(undefined, { 
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
