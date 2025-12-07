import React from 'react'
import { Link } from 'react-router-dom'
import { useAccount, useReadContract, useChainId } from 'wagmi'
import { Plus, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'
import { formatUnits } from 'viem'
import { CONTRACT_ADDRESSES, LISK_SEPOLIA_CHAIN_ID } from '../../constants/contracts'

const BorrowerDashboard: React.FC = () => {
  const { address } = useAccount()
  const chainId = useChainId()
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES[LISK_SEPOLIA_CHAIN_ID]

  // Get User Positions from Lens
  const { data: userPositions } = useReadContract({
    address: addresses.lens as `0x${string}`,
    abi: [{
      "type": "function",
      "name": "getUserLoans",
      "inputs": [
        { "name": "loanManager", "type": "address" },
        { "name": "user", "type": "address" }
      ],
      "outputs": [
        {
          "components": [
            { "name": "loanId", "type": "bytes32" },
            { "name": "borrower", "type": "address" },
            { "name": "nftContract", "type": "address" },
            { "name": "tokenId", "type": "uint256" },
            { "name": "totalBorrowed", "type": "uint256" },
            { "name": "remainingDebt", "type": "uint256" },
            { "name": "isActive", "type": "bool" }
          ],
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view"
    }] as const,
    functionName: 'getUserLoans',
    args: [addresses.loanManager, address!],
    query: { enabled: !!address && !!addresses.loanManager }
  })

  // Calculate Totals
  const totalDebt = userPositions?.reduce((acc, pos) => acc + parseFloat(formatUnits(pos.remainingDebt, 6)), 0) || 0
  // Lens V2 doesn't return value yet, assume 0 or ideally fetch from Oracle. For now 0 to fix crash/display.
  const totalCollateral = 0

  // Use first active position for main card display (simplified for MVP)
  const activePosition = userPositions?.find(p => p.remainingDebt > 0n)
  const activeDebt = activePosition ? parseFloat(formatUnits(activePosition.remainingDebt, 6)) : 0
  const activeCollateral = 0 // Placeholder
  const maxBorrow = activeCollateral * 0.25 // 25% LTV
  const availableToBorrow = Math.max(0, maxBorrow - activeDebt)

  const depositedTokenIds = userPositions?.map(p => p.tokenId.toString()) || []
  const depositedContracts = userPositions?.map(p => p.nftContract) || []
  const hasActiveLoan = activePosition !== undefined

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
      {/* Loan List */}
      <div className="space-y-6">
        {userPositions && userPositions.length > 0 ? (
          userPositions.map((position) => {
            const loanId = position.loanId
            const tokenId = position.tokenId.toString()
            const contractAddr = position.nftContract

            // Stats
            const debt = parseFloat(formatUnits(position.remainingDebt, 6))
            const initialLoan = parseFloat(formatUnits(position.totalBorrowed, 6))
            const repaid = initialLoan - debt
            const progress = initialLoan > 0 ? (repaid / initialLoan) * 100 : 0

            // Note: Value is 0 from Lens currently, would need separate fetch or update Lens
            // For UI completeness matching the request, we display what we have.
            const collateralValue = 0

            return (
              <div key={loanId} className="card-neo bg-white hover:shadow-neo-lg transition-all border-4 border-black p-0 overflow-hidden flex flex-col md:flex-row">
                {/* Left: NFT Image/Icon */}
                <div className="w-full md:w-48 aspect-square bg-neo-red flex items-center justify-center border-b-4 md:border-b-0 md:border-r-4 border-black p-4">
                  <div className="text-center text-white">
                    <p className="font-black text-2xl uppercase">veNFT</p>
                    <p className="font-bold">#{tokenId}</p>
                  </div>
                </div>

                {/* Right: Content */}
                <div className="flex-1 p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-black uppercase">veNFT #{tokenId}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className="bg-black text-white text-xs font-bold px-2 py-1 uppercase rounded">
                          {contractAddr.slice(0, 6)}...{contractAddr.slice(-4)}
                        </span>
                        {position.isActive && (
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 uppercase rounded">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-500 uppercase">Remaining Debt</p>
                      <p className="text-3xl font-black text-neo-red">
                        ${debt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Repayment Progress</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-4 bg-gray-200 border-2 border-black rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-neo-green absolute left-0 top-0 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t-2 border-gray-100">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">Initial Loan</p>
                      <p className="font-black text-lg">${initialLoan.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">Collateral Value</p>
                      <p className="font-black text-lg text-gray-400">$---</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">Yield Generated</p>
                      <p className="font-black text-lg text-neo-green">${repaid.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center justify-end">
                      <Link to={`/borrower/${tokenId}`} className="btn-neo bg-white text-xs px-4 py-2 h-auto">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="border-4 border-black border-dashed bg-gray-50 py-20 text-center">
            <DollarSign size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-2xl font-black uppercase mb-4 text-gray-400">No Active Loans</h3>
            <Link to="/borrower/select-collateral" className="btn-primary inline-flex items-center gap-2">
              <Plus size={20} /> Create Your First Loan
            </Link>
          </div>
        )}
      </div>


    </div>
  )
}

export default BorrowerDashboard
