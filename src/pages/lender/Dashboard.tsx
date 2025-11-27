import React from 'react'
import { Link } from 'react-router-dom'
import { useLenderStore } from '../../stores/lenderStore'
import { Plus, RefreshCcw, ArrowDownLeft } from 'lucide-react'

const LenderDashboard: React.FC = () => {
  const { totalDeposited, totalYieldEarned, positions, toggleAutoReinvest } = useLenderStore()

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-neo bg-black text-white">
          <h3 className="text-lg font-bold uppercase text-gray-400 mb-2">Total Deposited</h3>
          <p className="text-4xl font-black text-neo-white">${totalDeposited.toLocaleString()}</p>
        </div>
        <div className="card-neo bg-neo-yellow">
          <h3 className="text-lg font-bold uppercase text-black mb-2">Total Yield Earned</h3>
          <p className="text-4xl font-black text-black">+${totalYieldEarned.toLocaleString()}</p>
        </div>
        <div className="card-neo bg-white">
          <h3 className="text-lg font-bold uppercase text-gray-500 mb-2">Avg. APR</h3>
          <p className="text-4xl font-black text-neo-green">~20.0%</p>
        </div>
      </div>

      <h2 className="text-2xl font-black uppercase mt-8 mb-4">Active Deposits</h2>
      
      <div className="overflow-x-auto border-4 border-black shadow-neo">
        <table className="w-full bg-white text-left collapse">
          <thead className="bg-black text-white font-black uppercase">
            <tr>
              <th className="p-4 border-b-4 border-black">ID</th>
              <th className="p-4 border-b-4 border-black">Date</th>
              <th className="p-4 border-b-4 border-black">Amount</th>
              <th className="p-4 border-b-4 border-black">Yield Earned</th>
              <th className="p-4 border-b-4 border-black">Auto-Reinvest</th>
              <th className="p-4 border-b-4 border-black text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="font-bold">
            {positions.map((pos) => (
              <tr key={pos.id} className="border-b-2 border-gray-200 hover:bg-gray-50">
                <td className="p-4 text-gray-500 font-mono text-sm">{pos.id}</td>
                <td className="p-4">{new Date(pos.depositDate).toLocaleDateString()}</td>
                <td className="p-4 text-lg">${pos.depositAmount.toLocaleString()}</td>
                <td className="p-4 text-neo-green">+${pos.yieldEarned.toLocaleString()}</td>
                <td className="p-4">
                  <button
                    onClick={() => toggleAutoReinvest(pos.id)}
                    className={`
                      flex items-center gap-2 px-3 py-1 border-2 border-black text-xs uppercase transition-colors
                      ${pos.autoReinvest ? 'bg-neo-green text-black' : 'bg-gray-200 text-gray-500'}
                    `}
                  >
                    <RefreshCcw size={12} className={pos.autoReinvest ? 'animate-spin-slow' : ''} />
                    {pos.autoReinvest ? 'On' : 'Off'}
                  </button>
                </td>
                <td className="p-4 text-right">
                   <button className="btn-neo py-1 px-3 text-sm bg-white hover:bg-red-50 hover:text-red-600 border-2">
                     Withdraw
                   </button>
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
