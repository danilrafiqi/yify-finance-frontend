import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useNFTStore } from '../../stores/nftStore'
import { usePositionStore } from '../../stores/positionStore'
import NFTCard from '../../components/common/NFTCard'
import { ArrowLeft, TrendingUp, Wallet, Settings, Clock, AlertTriangle, FileText, Vote, BarChart3, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

const BorrowerDetail: React.FC = () => {
  const { idnft } = useParams<{ idnft: string }>()
  const navigate = useNavigate()
  const { getNFTById } = useNFTStore()
  const { positions } = usePositionStore()
  
  // Find the position for this NFT if it exists
  const position = positions.find(p => p.nftId === idnft)
  const nft = idnft ? getNFTById(idnft) : undefined

  // States
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'settings'>('overview')
  const [yieldConfig, setYieldConfig] = useState<'repay' | 'reinvest'>('repay')

  if (!nft || !position) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-black uppercase">Loan Position Not Found</h2>
        <button onClick={() => navigate('/borrower/dashboard')} className="btn-primary mt-4 flex items-center gap-2 mx-auto">
          <ArrowLeft /> Back to Dashboard
        </button>
      </div>
    )
  }

  const handleWithdraw = () => {
    if (position.remainingDebt > 0) {
      toast.error('Cannot withdraw while debt remains!')
      return
    }
    toast.success('NFT Withdrawn successfully!')
    navigate('/borrower/dashboard')
  }

  const handleRepay = () => {
    toast.success('Repayment simulation successful!')
  }

  const handleYieldConfigChange = (config: 'repay' | 'reinvest') => {
    if (nft.type !== 'veAERO' && nft.type !== 'veVELO') {
      toast.error('Yield reinvestment only available for veNFTs!')
      return
    }
    setYieldConfig(config)
    toast.success(`Yield configuration updated to: ${config === 'repay' ? 'Repay Debt' : 'Compound Reinvest'}`)
  }

  return (
    <div className="space-y-8">
      <button 
        onClick={() => navigate('/borrower/dashboard')} 
        className="flex items-center gap-2 font-bold hover:underline"
      >
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase flex items-center gap-4">
            Manage Collateral
            <span className={`text-lg px-3 py-1 border-2 border-black ${position.status === 'active' ? 'bg-neo-green' : 'bg-gray-200'}`}>
              {position.status}
            </span>
          </h1>
          <p className="font-bold text-gray-600 mt-2">ID: {position.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: NFT & Actions */}
        <div className="space-y-6">
          <NFTCard nft={nft} />
          
          <div className="card-neo bg-white space-y-4">
            <h3 className="text-xl font-black uppercase">Quick Actions</h3>
            
            <button 
              onClick={handleRepay}
              className="w-full btn-neo bg-neo-yellow text-black flex items-center justify-center gap-2"
            >
              <Wallet size={20} /> Manual Repay
            </button>
            
            <button 
              onClick={handleWithdraw}
              disabled={position.remainingDebt > 0}
              className={`w-full btn-neo flex items-center justify-center gap-2 ${
                position.remainingDebt > 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-400' 
                  : 'bg-white hover:bg-red-50 text-red-600'
              }`}
            >
              <ArrowUpRight size={20} /> Withdraw NFT
            </button>

             {(nft.type === 'veAERO' || nft.type === 'veVELO') && (
              <button className="w-full btn-neo bg-neo-blue text-white flex items-center justify-center gap-2">
                <Vote size={20} /> Vote veNFT
              </button>
            )}
            
            {nft.type === 'rwa' && (
              <button className="w-full btn-neo bg-neo-magenta text-white flex items-center justify-center gap-2">
                <FileText size={20} /> Claim RWA Yield
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Detailed View */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex gap-4 border-b-4 border-black pb-4 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`text-xl font-black uppercase px-4 py-2 ${activeTab === 'overview' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`text-xl font-black uppercase px-4 py-2 ${activeTab === 'history' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
            >
              Dividend History
            </button>
             <button 
              onClick={() => setActiveTab('settings')}
              className={`text-xl font-black uppercase px-4 py-2 ${activeTab === 'settings' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
            >
              Settings
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card-neo bg-neo-red text-white">
                    <h4 className="font-bold uppercase opacity-80">Remaining Debt</h4>
                    <p className="text-3xl font-black">${position.remainingDebt.toLocaleString()}</p>
                  </div>
                  <div className="card-neo bg-neo-green text-black">
                    <h4 className="font-bold uppercase opacity-80">Yield Generated</h4>
                    <p className="text-3xl font-black">${position.yieldGenerated.toLocaleString()}</p>
                  </div>
                </div>

                <div className="card-neo bg-white">
                    <h3 className="text-xl font-black uppercase mb-4">Repayment Progress</h3>
                    <div className="w-full h-8 bg-gray-200 border-4 border-black relative">
                        <motion.div 
                          className="h-full bg-neo-green"
                          initial={{ width: 0 }}
                          animate={{ width: `${position.repaymentProgress}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-2 font-bold">
                        <span>{position.repaymentProgress}% Repaid</span>
                        <span>{position.totalWeeks - position.currentWeek} Weeks Left</span>
                    </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="card-neo bg-white border-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black uppercase flex items-center gap-2">
                            <BarChart3 /> Dividend Performance
                        </h3>
                        <span className="text-sm font-bold text-gray-500">Last 30 Days</span>
                    </div>
                    {/* Placeholder for Chart */}
                    <div className="h-64 bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center font-bold text-gray-400">
                        [Yield Chart Visualization Placeholder]
                    </div>
                </div>

                <div className="overflow-x-auto border-4 border-black shadow-neo">
                    <table className="w-full bg-white text-left">
                    <thead className="bg-black text-white font-black uppercase">
                        <tr>
                        <th className="p-4 border-b-4 border-black">Date</th>
                        <th className="p-4 border-b-4 border-black">Type</th>
                        <th className="p-4 border-b-4 border-black">Amount</th>
                        <th className="p-4 border-b-4 border-black">Status</th>
                        </tr>
                    </thead>
                    <tbody className="font-bold">
                        {/* Mock History Data */}
                        <tr className="border-b-2 border-gray-200">
                            <td className="p-4">2024-03-15</td>
                            <td className="p-4">Dividend Payout</td>
                            <td className="p-4 text-neo-green">+$45.50</td>
                            <td className="p-4"><span className="bg-neo-green text-black text-xs px-2 py-1 border border-black">Distributed</span></td>
                        </tr>
                        <tr className="border-b-2 border-gray-200">
                            <td className="p-4">2024-03-08</td>
                            <td className="p-4">Dividend Payout</td>
                            <td className="p-4 text-neo-green">+$42.20</td>
                            <td className="p-4"><span className="bg-neo-green text-black text-xs px-2 py-1 border border-black">Distributed</span></td>
                        </tr>
                        <tr className="border-b-2 border-gray-200">
                            <td className="p-4">2024-03-01</td>
                            <td className="p-4">Dividend Payout</td>
                            <td className="p-4 text-neo-green">+$48.10</td>
                            <td className="p-4"><span className="bg-neo-green text-black text-xs px-2 py-1 border border-black">Distributed</span></td>
                        </tr>
                    </tbody>
                    </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                 <div className="card-neo bg-white">
                    <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
                        <Settings /> Yield Configuration
                    </h3>

                    <div className="space-y-4">
                        <label className={`flex items-center gap-4 p-4 border-4 border-black cursor-pointer transition-all ${yieldConfig === 'repay' ? 'bg-neo-yellow shadow-neo' : 'hover:bg-gray-50'}`}>
                            <input 
                                type="radio" 
                                name="yieldConfig" 
                                checked={yieldConfig === 'repay'} 
                                onChange={() => handleYieldConfigChange('repay')}
                                className="w-6 h-6 accent-black"
                            />
                            <div>
                                <h4 className="font-black uppercase text-lg">Auto-Repay Debt (Default)</h4>
                                <p className="text-sm font-bold text-gray-600">All generated yield is used to pay down your loan principal + interest.</p>
                            </div>
                        </label>

                        <label className={`flex items-center gap-4 p-4 border-4 border-black cursor-pointer transition-all ${yieldConfig === 'reinvest' ? 'bg-neo-cyan shadow-neo' : 'hover:bg-gray-50'}`}>
                            <input 
                                type="radio" 
                                name="yieldConfig" 
                                checked={yieldConfig === 'reinvest'}
                                onChange={() => handleYieldConfigChange('reinvest')}
                                className="w-6 h-6 accent-black"
                            />
                            <div>
                                <h4 className="font-black uppercase text-lg">Compound Reinvest (veNFT Only)</h4>
                                <p className="text-sm font-bold text-gray-600">Yield is reinvested to increase your voting power and future yield.</p>
                            </div>
                        </label>
                    </div>

                     {nft.type === 'rwa' && (
                        <div className="mt-4 p-4 bg-red-100 border-2 border-red-500 text-red-700 font-bold flex items-center gap-2">
                            <AlertTriangle /> Reinvestment is not available for Real World Assets (RWA).
                        </div>
                     )}
                 </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BorrowerDetail
