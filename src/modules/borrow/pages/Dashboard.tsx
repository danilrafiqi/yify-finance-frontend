// pages/borrower/Dashboard.tsx
// REFACTORED - Menggunakan viewmodel pattern
import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Loader2, DollarSign } from 'lucide-react'

import { useListViewModel } from '../viewmodels/list.viewmodel'
import { useContractAddresses } from '../../../shared/hooks/use-contract-addresses'

const BorrowerDashboard: React.FC = () => {
  const addresses = useContractAddresses()
  const { loanCards, isLoading } = useListViewModel()

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

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin" size={48} />
        </div>
      ) : loanCards.length === 0 ? (
        <div className="border-4 border-black border-dashed bg-gray-50 py-20 text-center">
          <DollarSign size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-2xl font-black uppercase mb-4 text-gray-400">No Active Loans</h3>
          <Link to="/borrower/select-collateral" className="btn-primary inline-flex items-center gap-2">
            <Plus size={20} /> Create Your First Loan
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {loanCards.map(({ loan, totalBorrowed, remainingDebt, repaid, progress, timeToPayoff }) => {
            const tokenId = loan.tokenId.toString()
            const contractAddr = loan.nftContract
            const isVeNFT = contractAddr.toLowerCase() === addresses.veNFT.toLowerCase()
            const isRwaNFT = contractAddr.toLowerCase() === addresses.rwaNFT.toLowerCase()
            const nftType = isVeNFT ? 'veNFT' : isRwaNFT ? 'RWA' : 'NFT'

            return (
              <div key={loan.id} className="card-neo bg-white hover:shadow-neo-lg transition-all border-4 border-black p-0 overflow-hidden flex flex-col md:flex-row">
                {/* Left: NFT Image/Icon */}
                <div className={`w-full md:w-48 aspect-square flex items-center justify-center border-b-4 md:border-b-0 md:border-r-4 border-black p-4 ${nftType === 'veNFT' ? 'bg-neo-red' : nftType === 'RWA' ? 'bg-neo-magenta' : 'bg-gray-600'}`}>
                  <div className="text-center text-white">
                    <p className="font-black text-2xl uppercase">{nftType}</p>
                    <p className="font-bold">#{tokenId}</p>
                  </div>
                </div>

                {/* Right: Content */}
                <div className="flex-1 p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-black uppercase">{nftType} #{tokenId}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className="bg-black text-white text-xs font-bold px-2 py-1 uppercase rounded">
                          {contractAddr.slice(0, 6)}...{contractAddr.slice(-4)}
                        </span>
                        {loan.isActive && (
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 uppercase rounded">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-500 uppercase">Remaining Debt</p>
                      <p className="text-3xl font-black text-neo-red">
                        ${remainingDebt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                      <p className="text-xs font-bold text-gray-500 uppercase">Total Borrowed</p>
                      <p className="font-black text-lg">${totalBorrowed.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">Est. Payoff</p>
                      <p className="font-black text-lg text-green-600">{timeToPayoff}</p>
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
          })}
        </div>
      )}
    </div>
  )
}

export default BorrowerDashboard
