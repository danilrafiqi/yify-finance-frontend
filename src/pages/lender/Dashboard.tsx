import React from 'react'
import { Link } from 'react-router-dom'
import { useLenderStore } from '../../stores/lenderStore'
import { Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

const LenderDashboard: React.FC = () => {
  const { totalDeposited, totalYieldEarned, currentBalance, history } = useLenderStore()

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
          <p className="text-4xl font-black text-neo-white">${currentBalance.toLocaleString()}</p>
        </div>
        <div className="card-neo bg-white text-black">
          <h3 className="text-lg font-bold uppercase text-gray-500 mb-2">Total Deposited</h3>
          <p className="text-4xl font-black">${totalDeposited.toLocaleString()}</p>
        </div>
        <div className="card-neo bg-neo-yellow">
          <h3 className="text-lg font-bold uppercase text-black mb-2">Total Yield Earned</h3>
          <p className="text-4xl font-black text-black">+${totalYieldEarned.toLocaleString()}</p>
        </div>
        <div className="card-neo bg-white">
          <h3 className="text-lg font-bold uppercase text-gray-500 mb-2">Current APR</h3>
          <p className="text-4xl font-black text-neo-green">~20.0%</p>
        </div>
      </div>

      <h2 className="text-2xl font-black uppercase mt-8 mb-4">Withdrawal & Deposit History</h2>
      
      <div className="overflow-x-auto border-4 border-black shadow-neo">
        <table className="w-full bg-white text-left">
          <thead className="bg-black text-white font-black uppercase">
            <tr>
              <th className="p-4 border-b-4 border-black">Type</th>
              <th className="p-4 border-b-4 border-black">Date</th>
              <th className="p-4 border-b-4 border-black">Amount</th>
              <th className="p-4 border-b-4 border-black">Status</th>
            </tr>
          </thead>
          <tbody className="font-bold">
            {history.map((tx) => (
              <tr key={tx.id} className="border-b-2 border-gray-200 hover:bg-gray-50">
                <td className="p-4 uppercase flex items-center gap-2">
                   {tx.type === 'deposit' && <ArrowDownLeft className="text-neo-green" />}
                   {tx.type === 'withdraw' && <ArrowUpRight className="text-neo-red" />}
                   {tx.type === 'yield' && <Plus className="text-neo-yellow" />}
                   {tx.type}
                </td>
                <td className="p-4">{new Date(tx.date).toLocaleDateString()}</td>
                <td className={`p-4 text-lg ${tx.type === 'withdraw' ? 'text-red-600' : 'text-green-600'}`}>
                    {tx.type === 'withdraw' ? '-' : '+'}${tx.amount.toLocaleString()}
                </td>
                <td className="p-4">
                  <span className="bg-black text-white px-2 py-1 text-xs uppercase">{tx.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default LenderDashboard
