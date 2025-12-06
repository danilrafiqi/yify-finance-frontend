import React from 'react'
import { Link } from 'react-router-dom'
import { useAccount, useReadContract, useChainId } from 'wagmi'
import { Plus, Loader2, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'
import { formatUnits } from 'viem'
import { CONTRACT_ADDRESSES, LISK_SEPOLIA_CHAIN_ID, LENDING_POOL_ABI, COLLATERAL_MANAGER_ABI } from '../../constants/contracts'

const BorrowerDashboard: React.FC = () => {
  const { address } = useAccount()
  const chainId = useChainId()
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES[LISK_SEPOLIA_CHAIN_ID]

  // Get Borrowing Info
  const { data: borrowingInfo, isLoading: isLoadingInfo } = useReadContract({
    address: addresses.lendingPool as `0x${string}`,
    abi: LENDING_POOL_ABI,
    functionName: 'getUserBorrowingInfo',
    args: [address!],
    query: { enabled: !!address }
  })

  // Get Deposited Collaterals
  const { data: userCollaterals } = useReadContract({
    address: addresses.collateralManager as `0x${string}`,
    abi: COLLATERAL_MANAGER_ABI,
    functionName: 'getUserCollaterals',
    args: [address!],
    query: { enabled: !!address }
  })

  // Parse Data - Mixed decimals issue
  // collateralValue: 18 decimals (from NFT Oracle)
  // currentDebt: 6 decimals (USDC)
  // maxBorrow & available: 18 decimals (calculated from collateralValue in contract, but should be USDC)
  const collateralValue = borrowingInfo ? parseFloat(formatUnits(borrowingInfo[0], 18)) : 0
  const currentDebt = borrowingInfo ? parseFloat(formatUnits(borrowingInfo[1], 6)) : 0
  // Contract returns maxBorrow in 18 decimals, convert to 6 for USDC
  const maxBorrow = borrowingInfo ? parseFloat(formatUnits(borrowingInfo[2], 18)) : 0
  const availableToBorrow = borrowingInfo ? parseFloat(formatUnits(borrowingInfo[3], 18)) : 0

  const depositedTokenIds = userCollaterals ? userCollaterals[1].map(id => id.toString()) : []
  const depositedContracts = userCollaterals ? userCollaterals[0] : []

  const hasActiveLoan = currentDebt > 0

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase">My Loans</h1>
          <p className="font-bold text-gray-600">Track your active borrowing positions.</p>
        </div>
        <Link to="/borrower/select-collateral" className="btn-primary flex items-center gap-2">
          <Plus size={24} strokeWidth={3} /> New Loan
        </Link>
      </div>

      {/* Active Loan Positions */}
      {hasActiveLoan ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-black uppercase">Active Positions</h2>

          {/* Main Loan Card */}
          <div className="card-neo bg-white hover:shadow-neo-lg transition-shadow">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Loan Stats */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black uppercase">Loan Position</h3>
                    <span className="bg-green-100 text-green-700 font-bold px-2 py-1 text-xs uppercase rounded mt-2 inline-block">
                      Active
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-500 uppercase">Outstanding Debt</p>
                    <p className="text-4xl font-black text-neo-red">${currentDebt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t-2 border-gray-100">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Collateral Value</p>
                    <p className="text-xl font-black">${collateralValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Max Borrow (25% LTV)</p>
                    <p className="text-xl font-black">${maxBorrow.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Available</p>
                    <p className="text-xl font-black text-neo-green">${availableToBorrow.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Current LTV</p>
                    <p className="text-xl font-black text-neo-blue">
                      {collateralValue > 0 ? ((currentDebt / collateralValue) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">NFTs Locked</p>
                    <p className="text-xl font-black">{depositedTokenIds.length}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Health</p>
                    <p className="text-xl font-black text-neo-green">Healthy</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 justify-center border-l-2 border-gray-100 pl-6">
                <Link
                  to="/borrower/select-collateral"
                  className="btn-neo bg-neo-green text-center w-full"
                >
                  Add More Collateral
                </Link>
                <Link
                  to="/borrower/select-collateral"
                  className="btn-neo bg-neo-blue text-center w-full"
                >
                  Borrow More
                </Link>
                <div className="pt-2 border-t-2 border-gray-100">
                  <p className="text-xs font-bold text-gray-500">
                    <AlertCircle size={12} className="inline mr-1" />
                    Repaid automatically via yield
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Collateral NFTs */}
          {depositedTokenIds.length > 0 && (
            <div>
              <h3 className="text-xl font-black uppercase mb-4">Locked Collateral ({depositedTokenIds.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {depositedTokenIds.map((id, index) => (
                  <Link
                    key={`${id}-${index}`}
                    to={`/borrower/${id}`}
                    className="card-neo bg-white hover:shadow-neo-lg transition-all hover:scale-105 cursor-pointer p-4"
                  >
                    <div className="aspect-square bg-gray-200 border-2 border-black flex items-center justify-center mb-2">
                      <span className="font-black text-lg text-gray-400">#{id}</span>
                    </div>
                    <p className="text-sm font-bold text-center">Token #{id}</p>
                    <p className="text-xs text-gray-500 text-center truncate">
                      {depositedContracts[index]?.slice(0, 6)}...{depositedContracts[index]?.slice(-4)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="border-4 border-black border-dashed bg-gray-50 py-20 text-center">
          <DollarSign size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-2xl font-black uppercase mb-4 text-gray-400">No Active Loans</h3>
          <p className="font-bold text-gray-500 mb-8">
            Start by selecting an NFT from your wallet to use as collateral.
          </p>
          <Link to="/borrower/select-collateral" className="btn-primary inline-flex items-center gap-2">
            <Plus size={20} /> Create Your First Loan
          </Link>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-neo bg-black text-white">
          <h3 className="text-sm font-bold uppercase text-gray-400 mb-2">Total Borrowed</h3>
          <p className="text-3xl font-black flex items-center gap-2">
            ${currentDebt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            {isLoadingInfo && <Loader2 className="animate-spin" size={20} />}
          </p>
        </div>

        <div className="card-neo bg-white">
          <h3 className="text-sm font-bold uppercase text-gray-500 mb-2">Total Collateral</h3>
          <p className="text-3xl font-black">
            ${collateralValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="card-neo bg-neo-green text-black">
          <h3 className="text-sm font-bold uppercase mb-2 flex items-center gap-1">
            <TrendingUp size={16} /> Borrowing Power
          </h3>
          <p className="text-3xl font-black">
            ${availableToBorrow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  )
}

export default BorrowerDashboard
