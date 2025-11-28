import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLenderStore } from '../../stores/lenderStore'
import { useWalletStore } from '../../stores/walletStore'
import { toast } from 'react-hot-toast'
import { ArrowRight, Wallet, CheckCircle } from 'lucide-react'

const LenderDeposit: React.FC = () => {
  const navigate = useNavigate()
  const { deposit } = useLenderStore()
  const { currentWallet } = useWalletStore()
  const [amount, setAmount] = useState<number>(0)
  const [isApproving, setIsApproving] = useState(false)
  const [isApproved, setIsApproved] = useState(false)

  const handleApprove = async () => {
    setIsApproving(true)
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsApproving(false)
    setIsApproved(true)
    toast.success('USDC Spend Approved!')
  }

  const handleDeposit = async () => {
    if (amount <= 0) return
    
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    deposit(amount)
    toast.success(`Successfully deposited $${amount.toLocaleString()} USDC`)
    navigate('/lender/dashboard')
  }

  const maxBalance = currentWallet?.balance || 0

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black uppercase">Deposit USDC</h1>
        <p className="font-bold text-gray-600">Earn 20% APR from real yield assets.</p>
      </div>

      <div className="card-neo bg-white space-y-6">
        {/* Balance Display */}
        <div className="flex justify-between items-center bg-gray-100 p-4 border-2 border-black">
          <span className="font-bold text-gray-500 uppercase flex items-center gap-2">
            <Wallet size={18} /> Wallet Balance
          </span>
          <span className="font-black text-xl">${maxBalance.toLocaleString()} USDC</span>
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
             <p className="text-xs font-bold uppercase text-neo-blue">Est. Gas</p>
             <p className="text-xl font-black">~$2.50</p>
           </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          {!isApproved ? (
            <button
              onClick={handleApprove}
              disabled={isApproving || amount <= 0}
              className={`
                w-full btn-neo bg-neo-yellow flex justify-center items-center gap-2
                ${(isApproving || amount <= 0) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isApproving ? 'Approving...' : '1. Approve USDC'}
            </button>
          ) : (
             <div className="w-full btn-neo bg-green-100 text-green-700 flex justify-center items-center gap-2 cursor-default border-green-700">
               <CheckCircle size={20} /> Approved
             </div>
          )}

          <button
            onClick={handleDeposit}
            disabled={!isApproved || amount <= 0}
            className={`
              w-full btn-secondary flex justify-center items-center gap-2
              ${(!isApproved || amount <= 0) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            2. Deposit USDC <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default LenderDeposit
