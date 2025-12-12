import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useChainId } from 'wagmi'
import { toast } from 'react-hot-toast'
import { Clock, DollarSign } from 'lucide-react'
import { parseUnits, formatUnits } from 'viem'
import { CONTRACT_ADDRESSES, LISK_SEPOLIA_CHAIN_ID, LENDING_POOL_ABI, LOAN_MANAGER_ABI, ERC721_ABI, SIMPLE_ORACLE_ABI } from '../../constants/contracts'

const LoanCalculator: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const tokenIdFromUrl = searchParams.get('tokenId')
  const contractFromUrl = searchParams.get('contract')

  const { address } = useAccount() // Ensure we have account context if needed, though address not explicitly used here except for internal wagmi context likely
  const chainId = useChainId()

  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES[LISK_SEPOLIA_CHAIN_ID]

  const [loanAmount, setLoanAmount] = useState<number>(0)
  const nftTokenId = tokenIdFromUrl || '0'
  const nftContract = contractFromUrl || addresses.veNFT // Default to veNFT if not specified

  // Read NFT Value from Oracle
  const { data: nftValueData } = useReadContract({
    address: addresses.nftOracle as `0x${string}`,
    abi: SIMPLE_ORACLE_ABI,
    functionName: 'getAssetPrice',
    args: [nftContract as `0x${string}`, BigInt(nftTokenId || '0')],
    query: { enabled: !!addresses.nftOracle && !!nftContract }
  })

  // Oracle returns 18 decimals.
  const nftValue = nftValueData ? parseFloat(formatUnits(nftValueData as bigint, 18)) : 0
  const maxBorrow = nftValue * 0.50 // 50% LTV based on LoanManager logic

  // Read Pool Stats to check available liquidity
  // Read Pool Stats to check available liquidity
  const { data: totalAssets } = useReadContract({
    address: addresses.lendingPool as `0x${string}`,
    abi: LENDING_POOL_ABI,
    functionName: 'totalAssets',
    query: { enabled: true }
  })

  // USDC uses 6 decimals
  const availableLiquidity = totalAssets ? parseFloat(formatUnits(totalAssets as bigint, 6)) : 0

  useEffect(() => {
    if (maxBorrow > 0) {
      setLoanAmount(Math.floor(maxBorrow * 0.5))
    }
  }, [maxBorrow])

  // Transactions
  const { writeContract: writeApprove, data: approveTxHash, isPending: isApproving, error: approveError } = useWriteContract()
  const { isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveTxHash })

  const { writeContract: writeBorrow, data: borrowTxHash, isPending: isBorrowing, error: borrowError } = useWriteContract()
  const { isSuccess: isBorrowSuccess } = useWaitForTransactionReceipt({ hash: borrowTxHash })

  // Error handling
  useEffect(() => {
    if (approveError) {
      toast.error(`Approve failed: ${approveError.message}`)
    }
  }, [approveError])

  useEffect(() => {
    if (borrowError) {
      console.error('Borrow error:', borrowError)
      toast.error(`Borrow failed: ${borrowError.message}`)
    }
  }, [borrowError])

  // Step tracking
  const [currentStep, setCurrentStep] = useState<'approve' | 'deposit' | 'borrow'>('approve')

  useEffect(() => {
    if (isApproveSuccess) {
      toast.success('NFT Approved!')
      setCurrentStep('deposit')
    }
  }, [isApproveSuccess])

  useEffect(() => {
    if (isBorrowSuccess) {
      toast.success(`Successfully borrowed $${loanAmount}!`)
      navigate('/borrower/dashboard')
    }
  }, [isBorrowSuccess, loanAmount, navigate])

  const handleApprove = () => {
    writeApprove({
      address: nftContract as `0x${string}`,
      abi: ERC721_ABI,
      functionName: 'setApprovalForAll',
      args: [addresses.loanManager as `0x${string}`, true]
    })
  }

  // Step 2: Borrow (Atomic: Deposit + Borrow)
  // V2 Optimization: We don't need separate deposit. Borrow calls transferFrom.

  const handleBorrow = () => {
    if (loanAmount <= 0) {
      toast.error('Loan amount must be greater than 0')
      return
    }
    if (loanAmount > availableLiquidity) {
      toast.error(`Insufficient pool liquidity. Available: $${availableLiquidity.toFixed(2)}`)
      return
    }
    writeBorrow({
      address: addresses.loanManager as `0x${string}`,
      abi: LOAN_MANAGER_ABI,
      functionName: 'borrow',
      args: [nftContract as `0x${string}`, BigInt(nftTokenId), parseUnits(String(loanAmount), 6)]
    })
  }

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

  // Calculations (assuming 20% APY for demo)
  const projectedYield = 20 // 20% APY
  const weeklyYield = (nftValue * (projectedYield / 100)) / 52
  const repaymentAllocation = weeklyYield * 0.75
  const weeksToRepay = loanAmount > 0 ? Math.ceil(loanAmount / repaymentAllocation) : 0
  const totalYieldGenerated = weeklyYield * weeksToRepay
  const originationFee = loanAmount * 0.008

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
                  {nftContract === addresses.veNFT ? 'veNFT' : 'RWA NFT'}
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
              LTV: {((loanAmount / nftValue) * 100).toFixed(1)}%
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
