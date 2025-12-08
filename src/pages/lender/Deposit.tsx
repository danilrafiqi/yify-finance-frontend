import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract, useChainId } from 'wagmi'
import { toast } from 'react-hot-toast'
import { ArrowRight, Wallet, CheckCircle, Coins } from 'lucide-react'
import { parseUnits, formatUnits } from 'viem'
import { CONTRACT_ADDRESSES, LISK_SEPOLIA_CHAIN_ID, LENDING_POOL_ABI, ERC20_ABI } from '../../constants/contracts'

const LenderDeposit: React.FC = () => {
  const navigate = useNavigate()

  const { address } = useAccount()
  const chainId = useChainId()

  // Get addresses for current chain (default to Lisk Sepolia if undefined)
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES[LISK_SEPOLIA_CHAIN_ID]

  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address: address,
    token: addresses.usdc as `0x${string}`,
  })

  // Format balance for display
  const balanceValue = balanceData ? parseFloat(formatUnits(balanceData.value, balanceData.decimals)) : 0
  const balanceSymbol = balanceData?.symbol || 'USDC'

  const [amount, setAmount] = useState<number>(0)

  // Contract Writes
  const { writeContract: writeApprove, data: approveTxHash, isPending: isApproving } = useWriteContract()
  const { writeContract: writeDeposit, data: depositTxHash, isPending: isDepositing, error: depositError } = useWriteContract()
  const { writeContract: writeMint } = useWriteContract()

  // Transaction Receipts
  const { isLoading: isWaitingApprove, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveTxHash })
  const { isLoading: isWaitingDeposit, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({ hash: depositTxHash })

  // Read Allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: addresses.usdc as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address!, addresses.lendingPool as `0x${string}`],
    query: {
      enabled: !!address,
    }
  })

  const currentAllowance = allowance ? parseFloat(formatUnits(allowance, balanceData?.decimals || 18)) : 0
  const isApproved = currentAllowance >= amount && amount > 0

  // Effects for Toasts
  useEffect(() => {
    if (isWaitingApprove) toast.loading('Approving USDC...')
    if (isApproveSuccess) {
      toast.dismiss()
      toast.success('USDC Approved!')
      refetchAllowance()
    }
  }, [isWaitingApprove, isApproveSuccess, refetchAllowance])

  useEffect(() => {
    if (isWaitingDeposit) toast.loading('Depositing funds...')
    if (isDepositSuccess) {
      toast.dismiss()
      toast.success(`Successfully deposited ${amount.toLocaleString()} ${balanceSymbol}`)
      navigate('/lender/dashboard')
    }
  }, [isWaitingDeposit, isDepositSuccess, amount, balanceSymbol, navigate])

  useEffect(() => {
    if (depositError) {
      toast.error(`Deposit Failed: ${depositError.message}`)
    }
  }, [depositError])


  const handleApprove = () => {
    if (!address || amount <= 0) return
    writeApprove({
      address: addresses.usdc as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [addresses.lendingPool as `0x${string}`, parseUnits(amount.toString(), 6)]
    })
  }

  const handleDeposit = () => {
    if (!address || amount <= 0) return
    writeDeposit({
      address: addresses.lendingPool as `0x${string}`,
      abi: LENDING_POOL_ABI,
      functionName: 'deposit',
      args: [parseUnits(amount.toString(), 6)]
    })
  }

  const handleMint = () => {
    if (!address) return
    writeMint({
      address: addresses.usdc as `0x${string}`,
      abi: [{
        "type": "function",
        "name": "mintPublic",
        "inputs": [{ "name": "to", "type": "address" }, { "name": "amount", "type": "uint256" }],
        "outputs": [],
        "stateMutability": "nonpayable"
      }] as const,
      functionName: 'mintPublic',
      args: [address, parseUnits('1000', 6)] // USDC uses 6 decimals
    })
    toast.success('Minting 1000 Mock USDC...')
    setTimeout(refetchBalance, 2000)
  }

  const maxBalance = balanceValue

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black uppercase">Deposit {balanceSymbol}</h1>
        <p className="font-bold text-gray-600">Earn 20% APR from real yield assets.</p>

        {/* Helper for Testnet */}
        {balanceValue < 100 && (
          <button onClick={handleMint} className="text-xs underline text-neo-blue font-bold flex items-center gap-1 mx-auto">
            <Coins size={14} /> Faucet: Mint 1000 Mock USDC
          </button>
        )}
      </div>

      <div className="card-neo bg-white space-y-6">
        {/* Balance Display */}
        <div className="flex justify-between items-center bg-gray-100 p-4 border-2 border-black">
          <span className="font-bold text-gray-500 uppercase flex items-center gap-2">
            <Wallet size={18} /> Wallet Balance
          </span>
          <span className="font-black text-xl">{maxBalance.toLocaleString()} {balanceSymbol}</span>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="font-black uppercase text-sm">Amount to Deposit</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="input-neo text-2xl pr-24"
              placeholder="0.00"
            />
            <button
              onClick={() => setAmount(maxBalance)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold bg-black text-white px-2 py-1 uppercase hover:bg-gray-800"
            >
              Max
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-neo-green/10 p-3 border-2 border-neo-green">
            <p className="text-xs font-bold uppercase text-neo-green">Expected APR</p>
            <p className="text-xl font-black">20.0%</p>
          </div>
          <div className="bg-neo-blue/10 p-3 border-2 border-neo-blue">
            <p className="text-xs font-bold uppercase text-neo-blue">Current Chain</p>
            <p className="text-xl font-black">#{chainId}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          {!isApproved ? (
            <button
              onClick={handleApprove}
              disabled={isApproving || isWaitingApprove || amount <= 0}
              className={`
                w-full btn-neo bg-neo-yellow flex justify-center items-center gap-2
                ${(isApproving || isWaitingApprove || amount <= 0) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isApproving || isWaitingApprove ? 'Approving...' : `1. Approve ${balanceSymbol}`}
            </button>
          ) : (
            <div className="w-full btn-neo bg-green-100 text-green-700 flex justify-center items-center gap-2 cursor-default border-green-700">
              <CheckCircle size={20} /> Approved
            </div>
          )}

          <button
            onClick={handleDeposit}
            disabled={!isApproved || isDepositing || isWaitingDeposit || amount <= 0}
            className={`
              w-full btn-secondary flex justify-center items-center gap-2
              ${(!isApproved || isDepositing || isWaitingDeposit || amount <= 0) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isDepositing || isWaitingDeposit ? 'Depositing...' : `2. Deposit ${balanceSymbol}`} <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default LenderDeposit
