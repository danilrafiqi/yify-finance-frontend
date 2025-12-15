// modules/borrow/components/SettingsTab.tsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Zap, TrendingUp, Save, CheckCircle } from 'lucide-react'
import { Loan } from '../models/loan'
import { useContractAddresses } from '../../../shared/hooks/use-contract-addresses'

interface SettingsTabProps {
  loan: Loan
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ loan }) => {
  const addresses = useContractAddresses()
  const [yieldMode, setYieldMode] = useState<'auto-repay' | 'compound'>('auto-repay')
  const [compoundPercentage, setCompoundPercentage] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  // Check if NFT is veNFT (has voting power)
  const isVeNFT = loan.nftContract.toLowerCase() === addresses.veNFT.toLowerCase()

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save (in real app, this would call a contract or API)
    setTimeout(() => {
      setIsSaving(false)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    }, 1000)
  }

  // Calculate projected impact
  const projectedVotingPowerIncrease = compoundPercentage > 0 
    ? (compoundPercentage / 100) * 10 // Simplified calculation
    : 0

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="card-neo bg-white">
        <div className="flex items-center gap-3 mb-6">
          <Settings size={24} />
          <h3 className="text-xl font-black uppercase">Yield Configuration</h3>
        </div>

        {!isVeNFT && (
          <div className="bg-yellow-50 border-4 border-yellow-400 p-4 mb-6">
            <p className="font-bold text-yellow-800">
              ⚠️ Yield settings are only available for veNFTs (voting escrow NFTs)
            </p>
            <p className="text-sm text-yellow-700 mt-2">
              Your NFT type does not support compound reinvest mode. Auto-repay mode is always active.
            </p>
          </div>
        )}

        {/* Auto-Repay Mode */}
        <div className="space-y-4 mb-6 pb-6 border-b-4 border-black">
          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="auto-repay"
              name="yield-mode"
              value="auto-repay"
              checked={yieldMode === 'auto-repay'}
              onChange={() => setYieldMode('auto-repay')}
              className="w-5 h-5 border-2 border-black"
              disabled={!isVeNFT}
            />
            <label htmlFor="auto-repay" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-3">
                <Zap className="text-neo-green" size={24} />
                <div>
                  <h4 className="font-black uppercase text-lg">Auto-Repay Mode</h4>
                  <p className="text-sm font-bold text-gray-600">
                    All generated yield automatically allocated to debt repayment
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Default setting for maximum debt reduction speed. No manual intervention required.
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Compound Reinvest Mode */}
        {isVeNFT && (
          <div className="space-y-4 mb-6 pb-6 border-b-4 border-black">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="compound"
                name="yield-mode"
                value="compound"
                checked={yieldMode === 'compound'}
                onChange={() => setYieldMode('compound')}
                className="w-5 h-5 border-2 border-black"
              />
              <label htmlFor="compound" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <TrendingUp className="text-neo-blue" size={24} />
                  <div>
                    <h4 className="font-black uppercase text-lg">Compound Reinvest Mode</h4>
                    <p className="text-sm font-bold text-gray-600">
                      Yield reinvested to increase voting power and future yield potential
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {yieldMode === 'compound' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-4 space-y-4 pl-8"
              >
                <div>
                  <label className="block font-bold uppercase text-sm mb-2">
                    Allocation: {compoundPercentage}% Reinvest / {100 - compoundPercentage}% Repay
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={compoundPercentage}
                    onChange={(e) => setCompoundPercentage(Number(e.target.value))}
                    className="w-full h-3 bg-gray-200 border-2 border-black rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${compoundPercentage}%, #e5e7eb ${compoundPercentage}%, #e5e7eb 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs font-bold mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Projected Impact */}
                <div className="bg-neo-blue/10 p-4 border-2 border-neo-blue">
                  <h5 className="font-black uppercase text-sm mb-2">Projected Impact</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-bold">Voting Power Increase:</span>
                      <span className="font-black text-neo-blue">+{projectedVotingPowerIncrease.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">Future Yield Potential:</span>
                      <span className="font-black text-neo-green">+{(projectedVotingPowerIncrease * 0.3).toFixed(2)}% APR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">Debt Repayment Rate:</span>
                      <span className="font-black text-neo-red">-{((100 - compoundPercentage) * 0.75).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Current Active Configuration */}
        <div className="bg-gray-100 p-4 border-2 border-black mb-6">
          <h5 className="font-black uppercase text-sm mb-2">Current Active Configuration</h5>
          <div className="flex items-center gap-2">
            {yieldMode === 'auto-repay' ? (
              <>
                <Zap className="text-neo-green" size={20} />
                <span className="font-bold">Auto-Repay Mode Active</span>
              </>
            ) : (
              <>
                <TrendingUp className="text-neo-blue" size={20} />
                <span className="font-bold">
                  Compound Mode: {compoundPercentage}% Reinvest / {100 - compoundPercentage}% Repay
                </span>
              </>
            )}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving || isSaved}
          className={`
            w-full btn-neo flex items-center justify-center gap-2 text-lg
            ${isSaved 
              ? 'bg-neo-green text-black' 
              : 'bg-black text-white hover:bg-gray-800'
            }
            ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isSaving ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Save size={20} />
              </motion.div>
              Saving Configuration...
            </>
          ) : isSaved ? (
            <>
              <CheckCircle size={20} />
              Configuration Saved!
            </>
          ) : (
            <>
              <Save size={20} />
              Save Configuration
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 mt-2 text-center">
          Changes will take effect on the next yield distribution cycle
        </p>
      </div>
    </motion.div>
  )
}

