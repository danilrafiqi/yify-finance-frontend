// pages/lender/Deposit.tsx
// REFACTORED - Menggunakan viewmodel pattern
import React from 'react'
import { ArrowRight, Wallet, CheckCircle, Coins } from 'lucide-react'

import { useDepositViewModel } from '../viewmodels/deposit.viewmodel'

const LenderDeposit: React.FC = () => {
  const {
    amount,
    setAmount,
    balanceValue,
    balanceSymbol,
    chainId,
    isApproved,
    approve,
    deposit,
    mint,
    isApproving,
    isDepositing,
    isMinting,
    maxBalance
  } = useDepositViewModel()

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black uppercase">Deposit {balanceSymbol}</h1>
        <p className="font-bold text-gray-600">Earn 20% APR from real yield assets.</p>

        {/* Helper for Testnet */}
        {balanceValue < 100 && (
          <button 
            onClick={() => mint()} 
            disabled={isMinting}
            className="text-xs underline text-neo-blue font-bold flex items-center gap-1 mx-auto"
          >
            <Coins size={14} /> Faucet: Mint 1000 Mock USDC
            {isMinting && ' (Minting...)'}
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
              onClick={() => approve()}
              disabled={isApproving || amount <= 0}
              className={`
                w-full btn-neo bg-neo-yellow flex justify-center items-center gap-2
                ${(isApproving || amount <= 0) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isApproving ? 'Approving...' : `1. Approve ${balanceSymbol}`}
            </button>
          ) : (
            <div className="w-full btn-neo bg-green-100 text-green-700 flex justify-center items-center gap-2 cursor-default border-green-700">
              <CheckCircle size={20} /> Approved
            </div>
          )}

          <button
            onClick={() => deposit()}
            disabled={!isApproved || isDepositing || amount <= 0}
            className={`
              w-full btn-secondary flex justify-center items-center gap-2
              ${(!isApproved || isDepositing || amount <= 0) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isDepositing ? 'Depositing...' : `2. Deposit ${balanceSymbol}`} <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default LenderDeposit
