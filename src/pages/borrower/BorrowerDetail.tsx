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
  const [reinvestRatio, setReinvestRatio] = useState<number>(50) // 50% default
  const [manualRepayAmount, setManualRepayAmount] = useState<string>('')
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [currentSavedConfig, setCurrentSavedConfig] = useState<{mode: 'repay' | 'reinvest', ratio?: number}>({mode: 'repay'})

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

  const handleManualRepay = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualRepayAmount || Number(manualRepayAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    toast.success(`Successfully repaid $${manualRepayAmount}`)
    setManualRepayAmount('')
  }

  const handleYieldConfigChange = (config: 'repay' | 'reinvest') => {
    if (nft.type !== 'veAERO' && nft.type !== 'veVELO') {
      toast.error('Yield reinvestment only available for veNFTs!')
      return
    }
    setYieldConfig(config)
  }

  const handleSaveConfiguration = async () => {
    if (nft.type !== 'veAERO' && nft.type !== 'veVELO' && yieldConfig === 'reinvest') {
      toast.error('Yield reinvestment only available for veNFTs!')
      return
    }

    setIsSaving(true)

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Save configuration
    const newConfig = {
      mode: yieldConfig,
      ratio: yieldConfig === 'reinvest' ? reinvestRatio : undefined
    }

    setCurrentSavedConfig(newConfig)
    setIsSaving(false)

    toast.success(`Configuration saved successfully! ${yieldConfig === 'repay' ? '100% Auto-Repay' : `${reinvestRatio}% Reinvest / ${100 - reinvestRatio}% Repay`}`)
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
            
            <div className="border-b-4 border-black pb-4 mb-4">
              <h4 className="font-bold uppercase mb-2">Manual Repay</h4>
              <form onSubmit={handleManualRepay} className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="Amount" 
                  value={manualRepayAmount}
                  onChange={(e) => setManualRepayAmount(e.target.value)}
                  className="w-full border-2 border-black p-2 font-bold focus:outline-none focus:bg-neo-yellow"
                />
                <button type="submit" className="btn-neo bg-black text-white p-2">
                  <Wallet size={20} />
                </button>
              </form>
            </div>
            
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
              Yield Settings
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
                        <span>{position.repaymentProgress.toFixed(1)}% Repaid</span>
                        <span>{Math.max(0, position.totalWeeks - position.currentWeek)} Weeks Left</span>
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
                        
                        <div className="flex gap-2">
                           <button className="px-3 py-1 text-sm font-bold bg-black text-white">1W</button>
                           <button className="px-3 py-1 text-sm font-bold bg-gray-200 hover:bg-gray-300">1M</button>
                           <button className="px-3 py-1 text-sm font-bold bg-gray-200 hover:bg-gray-300">ALL</button>
                        </div>
                    </div>
                    {/* Placeholder for Chart */}
                    <div className="h-64 bg-gray-50 border-2 border-dashed border-black flex flex-col items-center justify-center font-bold text-gray-400">
                        <BarChart3 size={48} className="mb-2 opacity-20" />
                        <p>Interactive Yield Chart Visualization</p>
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
                            <td className="p-4">2024-03-15 14:30</td>
                            <td className="p-4">Dividend Payout</td>
                            <td className="p-4 text-neo-green">+$45.50</td>
                            <td className="p-4"><span className="bg-neo-green text-black text-xs px-2 py-1 border border-black uppercase">Confirmed</span></td>
                        </tr>
                        <tr className="border-b-2 border-gray-200">
                            <td className="p-4">2024-03-08 14:30</td>
                            <td className="p-4">Dividend Payout</td>
                            <td className="p-4 text-neo-green">+$42.20</td>
                            <td className="p-4"><span className="bg-neo-green text-black text-xs px-2 py-1 border border-black uppercase">Confirmed</span></td>
                        </tr>
                        <tr className="border-b-2 border-gray-200">
                            <td className="p-4">2024-03-01 14:30</td>
                            <td className="p-4">Dividend Payout</td>
                            <td className="p-4 text-neo-green">+$48.10</td>
                            <td className="p-4"><span className="bg-neo-green text-black text-xs px-2 py-1 border border-black uppercase">Confirmed</span></td>
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
                        <Settings /> Yield Configuration Panel
                    </h3>

                    <div className="space-y-4">
                        <label className={`flex items-start gap-4 p-6 border-4 border-black cursor-pointer transition-all ${yieldConfig === 'repay' ? 'bg-neo-yellow shadow-neo' : 'hover:bg-gray-50'}`}>
                            <input 
                                type="radio" 
                                name="yieldConfig" 
                                checked={yieldConfig === 'repay'} 
                                onChange={() => handleYieldConfigChange('repay')}
                                className="mt-1 w-6 h-6 accent-black"
                            />
                            <div>
                                <h4 className="font-black uppercase text-xl mb-2">Auto-Repay Mode (Default)</h4>
                                <p className="font-bold text-gray-700 leading-relaxed">
                                    All generated yield is automatically allocated to pay down your loan principal + interest.
                                    This is the fastest way to become debt-free and unlock your NFT.
                                </p>
                            </div>
                        </label>

                        <label className={`block p-6 border-4 border-black cursor-pointer transition-all ${yieldConfig === 'reinvest' ? 'bg-neo-cyan shadow-neo' : 'hover:bg-gray-50'}`}>
                            <div className="flex items-start gap-4 mb-4">
                                <input 
                                    type="radio" 
                                    name="yieldConfig" 
                                    checked={yieldConfig === 'reinvest'}
                                    onChange={() => handleYieldConfigChange('reinvest')}
                                    className="mt-1 w-6 h-6 accent-black"
                                />
                                <div>
                                    <h4 className="font-black uppercase text-xl mb-2">Compound Reinvest Mode (veNFT Only)</h4>
                                    <p className="font-bold text-gray-700 leading-relaxed">
                                        Reinvest yield to increase your voting power and future yield potential.
                                    </p>
                                </div>
                            </div>

                            {yieldConfig === 'reinvest' && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }} 
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="pl-10 mt-4 border-t-2 border-black pt-4"
                                >
                                    <h5 className="font-black uppercase mb-4">Reinvestment Allocation</h5>
                                    
                                    <div className="flex items-center justify-between mb-2 font-bold">
                                        <span>Debt Repayment: {100 - reinvestRatio}%</span>
                                        <span>Reinvest: {reinvestRatio}%</span>
                                    </div>
                                    
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        step="10"
                                        value={reinvestRatio}
                                        onChange={(e) => setReinvestRatio(Number(e.target.value))}
                                        className="w-full h-4 bg-white rounded-lg appearance-none cursor-pointer accent-black border-2 border-black mb-4"
                                    />

                                    <div className="p-4 bg-white border-2 border-black">
                                        <p className="font-bold text-sm mb-2 flex justify-between">
                                            <span>Projected Voting Power Increase:</span>
                                            <span className="text-neo-green">+{reinvestRatio * 0.5} veNFT</span>
                                        </p>
                                        <p className="font-bold text-sm flex justify-between">
                                            <span>Est. Debt Reduction Speed:</span>
                                            <span className="text-neo-red">-{reinvestRatio}% Slower</span>
                                        </p>
                                    </div>
                                </motion.div>
                            )}
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
