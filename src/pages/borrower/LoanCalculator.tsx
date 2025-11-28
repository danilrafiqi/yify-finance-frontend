import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useNFTStore } from '../../stores/nftStore'
import { usePositionStore } from '../../stores/positionStore'
import NFTCard from '../../components/common/NFTCard'
import { ArrowRight, Calculator, Clock, DollarSign, PieChart } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

const LoanCalculator: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const nftId = searchParams.get('nftId')
  
  const { getNFTById } = useNFTStore()
  const { createPosition } = usePositionStore()
  
  const nft = nftId ? getNFTById(nftId) : undefined
  const [loanAmount, setLoanAmount] = useState<number>(0)

  useEffect(() => {
    if (nft) {
      // Default to 50% of max borrow
      setLoanAmount(Math.floor(nft.maxBorrow * 0.5))
    }
  }, [nft])

  if (!nft) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-black uppercase">NFT Not Found</h2>
        <button onClick={() => navigate('/borrower/select-collateral')} className="btn-primary mt-4">
          Back to Selection
        </button>
      </div>
    )
  }

  // Calculations
  const weeklyYield = (nft.price * (nft.projectedYield / 100)) / 52
  const repaymentAllocation = weeklyYield * 0.75
  const weeksToRepay = Math.ceil(loanAmount / repaymentAllocation)
  const totalYieldGenerated = weeklyYield * weeksToRepay
  const originationFee = loanAmount * 0.008

  const handleBorrow = () => {
    createPosition(nft.id, loanAmount, nft.price)
    toast.success(`Successfully borrowed $${loanAmount} USDC!`)
    navigate('/borrower/dashboard')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-4xl font-black uppercase text-center">Loan Calculator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: NFT & Input */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-black uppercase mb-4">Selected Collateral</h3>
            <NFTCard nft={nft} />
          </div>

          <div className="card-neo bg-white">
            <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
              <DollarSign size={24} /> Loan Amount
            </h3>
            
            <div className="mb-6">
              <input
                type="range"
                min="100"
                max={nft.maxBorrow}
                step="10"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black border-2 border-black"
              />
              <div className="flex justify-between text-sm font-bold mt-2 text-gray-500">
                <span>$100</span>
                <span>Max: ${nft.maxBorrow.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center border-4 border-black p-2">
              <span className="text-2xl font-black px-2">$</span>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Math.min(nft.maxBorrow, Number(e.target.value)))}
                className="w-full text-3xl font-black focus:outline-none"
              />
            </div>
            
            <p className="text-sm font-bold text-gray-500 mt-2 text-right">
              LTV: {((loanAmount / nft.price) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Middle Column: Simulation */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card-neo bg-neo-cyan text-black">
            <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
              <Clock size={24} /> Repayment Simulation
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white border-4 border-black p-4 shadow-neo-sm">
                <p className="text-sm font-bold uppercase text-gray-500">Est. Time to Repay</p>
                <p className="text-3xl font-black">{weeksToRepay} Weeks</p>
              </div>
              <div className="bg-white border-4 border-black p-4 shadow-neo-sm">
                <p className="text-sm font-bold uppercase text-gray-500">Weekly Repayment</p>
                <p className="text-3xl font-black text-neo-green">${repaymentAllocation.toFixed(2)}</p>
              </div>
              <div className="bg-white border-4 border-black p-4 shadow-neo-sm">
                <p className="text-sm font-bold uppercase text-gray-500">Total Yield Gen.</p>
                <p className="text-3xl font-black text-neo-blue">${totalYieldGenerated.toFixed(2)}</p>
              </div>
              <div className="bg-white border-4 border-black p-4 shadow-neo-sm">
                <p className="text-sm font-bold uppercase text-gray-500">Origination Fee (0.8%)</p>
                <p className="text-3xl font-black text-neo-red">${originationFee.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleBorrow}
            className="w-full btn-primary text-2xl py-6 shadow-neo-lg hover:shadow-neo hover:translate-y-1"
          >
            CONFIRM & BORROW ${loanAmount}
          </button>
          
          <p className="text-center font-bold text-gray-500 text-sm">
            By confirming, you agree to lock your NFT until the loan is fully repaid by the generated yield.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoanCalculator
