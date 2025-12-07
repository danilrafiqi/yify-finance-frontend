import React from 'react'
import { Link } from 'react-router-dom'
import { useAccount, useReadContract, useChainId } from 'wagmi'
import { Plus, Loader2 } from 'lucide-react'
import { formatUnits } from 'viem'
import { CONTRACT_ADDRESSES, LISK_SEPOLIA_CHAIN_ID } from '../../constants/contracts'

const LenderDashboard: React.FC = () => {
  const { address } = useAccount()
  const chainId = useChainId()
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES[LISK_SEPOLIA_CHAIN_ID]

  // Read: User Shares (balanceOf)
  const { data: userShares, isLoading: isLoadingShares } = useReadContract({
    address: addresses.lendingPool as `0x${string}`,
    abi: [{
      "type": "function",
      "name": "balanceOf",
      "inputs": [{ "name": "account", "type": "address" }],
      "outputs": [{ "name": "", "type": "uint256" }],
      "stateMutability": "view"
    }] as const,
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: !!address }
  })

  // Read: Share Value in Assets (convertToAssets)
  const { data: userAssets, isLoading: isLoadingAssets } = useReadContract({
    address: addresses.lendingPool as `0x${string}`,
    abi: [{
      "type": "function",
      "name": "convertToAssets",
      "inputs": [{ "name": "shares", "type": "uint256" }],
      "outputs": [{ "name": "", "type": "uint256" }],
      "stateMutability": "view"
    }] as const,
    functionName: 'convertToAssets',
    args: [userShares || 0n], // Convert current shares to assets
    query: { enabled: !!userShares }
  })

  // Calculations - USDC uses 6 decimals
  const currentValue = userAssets ? parseFloat(formatUnits(userAssets, 6)) : 0
  const apr = 20.0 // Hardcoded for demo

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card-neo bg-black text-white">
          <h3 className="text-lg font-bold uppercase text-gray-400 mb-2">Current Balance (yUSDC)</h3>
          <p className="text-4xl font-black text-neo-white flex items-center gap-2">
            ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            {(isLoadingShares || isLoadingAssets) && <Loader2 className="animate-spin" size={20} />}
          </p>
        </div>
        {/* Principal tracking removed for V2 MVP - requires Indexer */}
        <div className="card-neo bg-white">
          <h3 className="text-lg font-bold uppercase text-gray-500 mb-2">Current APR</h3>
          <p className="text-4xl font-black text-neo-green">~{apr}%</p>
        </div>
      </div>

      <h2 className="text-2xl font-black uppercase mt-8 mb-4">Activities</h2>

      <div className="bg-white border-4 border-black p-8 text-center text-gray-500">
        <p className="font-bold text-lg">Transaction history is indexed on the blockchain.</p>
        <p className="text-sm">Check your wallet or block explorer for detailed history.</p>
        <div className="mt-4 flex justify-center gap-4">
          <a
            href={`https://sepolia-blockscout.lisk.com/address/${addresses.lendingPool}`}
            target="_blank"
            rel="noreferrer"
            className="underline text-neo-blue font-bold hover:text-black"
          >
            View Lending Pool Contract
          </a>
        </div>
      </div>
    </div>
  )
}

export default LenderDashboard
