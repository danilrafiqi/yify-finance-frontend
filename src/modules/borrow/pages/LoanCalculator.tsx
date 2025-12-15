import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, DollarSign } from 'lucide-react'
import { useCalculatorViewModel } from '../viewmodels/calculator.viewmodel'

const LoanCalculator: React.FC = () => {
  const navigate = useNavigate()
  const {
    tokenIdFromUrl,
    nftTokenId,
    nftContract,
    loanAmount,
    setLoanAmount,
    nftValue,
    maxBorrow,
    availableLiquidity,
    currentStep,
    isApproving,
    isBorrowing,
    isApproveSuccess,
    handleApprove,
    handleBorrow,
    projectedYield,
    weeklyYield,
    repaymentAllocation,
    weeksToRepay,
    totalYieldGenerated,
    originationFee,
    ltv,
    contractAddresses
  } = useCalculatorViewModel()

  if (!tokenIdFromUrl) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-black uppercase">No NFT Selected</h2>
        <button onClick={() => navigate('/borrower/select-collateral')} className="btn-primary mt-4">
          Back to Selection
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-4xl font-black uppercase text-center">Loan Calculator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: NFT Info & Input */}
        <div className="space-y-8">
          {/* NFT Display */}
          <div className="card-neo bg-white">
            <h3 className="text-xl font-black uppercase mb-4">Selected Collateral</h3>
            <div className="aspect-square bg-gray-200 border-2 border-black flex items-center justify-center mb-4">
              <span className="font-black text-4xl text-gray-400">#{nftTokenId}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-bold text-gray-500">Token ID</span>
                <span className="font-black">#{nftTokenId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-gray-500">Contract</span>
                <span className="font-black text-xs">
                  {nftContract === contractAddresses.veNFT ? 'veNFT' : 'RWA NFT'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-gray-500">Collateral Value</span>
                <span className="font-black text-neo-green">${nftValue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="card-neo bg-white">
            <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
              <DollarSign size={24} /> Loan Amount
            </h3>

            <div className="mb-6">
              <input
                type="range"
                min="0"
                max={maxBorrow}
                step="1"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black border-2 border-black"
              />
              <div className="flex justify-between text-sm font-bold mt-2 text-gray-500">
                <span>$0</span>
                <span>Max: ${maxBorrow.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center border-4 border-black p-2">
              <span className="text-2xl font-black px-2">$</span>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Math.min(maxBorrow, Number(e.target.value)))}
                className="w-full text-3xl font-black focus:outline-none"
              />
            </div>

            <p className="text-sm font-bold text-gray-500 mt-2 text-right">
              LTV: {ltv.toFixed(1)}%
            </p>

            {/* Pool Liquidity Warning */}
            {availableLiquidity < loanAmount && (
              <div className="mt-4 p-3 bg-red-100 border-2 border-red-500 rounded">
                <p className="text-sm font-bold text-red-700">
                  ⚠️ Insufficient pool liquidity! Available: ${availableLiquidity.toFixed(2)}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Please reduce loan amount or wait for lenders to deposit more USDC.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Simulation & Actions */}
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

          {/* 3-step Action */}
          <div className="card-neo bg-white space-y-4">
            <h3 className="text-xl font-black uppercase">Complete Borrowing Process</h3>
            <p className="text-sm text-gray-600 font-bold">
              Follow these steps: Approve → Borrow (Atomic Deposit included)
            </p>

            <div className="space-y-3">
              {/* Step 1: Approve */}
              <button
                onClick={handleApprove}
                disabled={isApproving || isApproveSuccess || currentStep !== 'approve'}
                className={`w-full btn-neo text-lg ${isApproveSuccess ? 'bg-green-100 border-green-700' : 'bg-neo-yellow'
                  } ${currentStep !== 'approve' && !isApproveSuccess ? 'opacity-50' : ''}`}
              >
                {isApproving ? '1. Approving...' : isApproveSuccess ? '✓ 1. Approved' : '1. Approve NFT'}
              </button>

              {/* Step 2: Borrow */}
              <button
                onClick={handleBorrow}
                disabled={!isApproveSuccess || isBorrowing || loanAmount <= 0}
                className={`w-full btn-primary text-xl py-6 ${!isApproveSuccess ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {isBorrowing ? '2. Processing Loan...' : `2. BORROW $${loanAmount}`}
              </button>
            </div>

            {isBorrowing && (
              <p className="text-center text-sm font-bold text-neo-blue animate-pulse">
                Processing Atomic Loan... (Deposit + Borrow in one tx)
              </p>
            )}
          </div>

          <p className="text-center font-bold text-gray-500 text-sm">
            By confirming, you agree to lock your NFT until the loan is fully repaid by the generated yield.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoanCalculator
