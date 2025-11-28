import React from 'react'
import { Link } from 'react-router-dom'
import { usePositionStore } from '../../stores/positionStore'
import { useNFTStore } from '../../stores/nftStore'
import { Plus, ArrowUpRight } from 'lucide-react'

const BorrowerDashboard: React.FC = () => {
  const { positions } = usePositionStore()
  const { getNFTById } = useNFTStore()

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase">My Loans</h1>
          <p className="font-bold text-gray-600">Track your active positions and repayment progress.</p>
        </div>
        <Link to="/borrower/select-collateral" className="btn-primary flex items-center gap-2">
          <Plus size={24} strokeWidth={3} /> New Loan
        </Link>
      </div>

      {positions.length === 0 ? (
        <div className="border-4 border-black border-dashed bg-gray-50 py-20 text-center">
          <h3 className="text-2xl font-black uppercase mb-4 text-gray-400">No Active Loans</h3>
          <p className="font-bold text-gray-500 mb-8">Start by selecting an NFT to borrow against.</p>
          <Link to="/borrower/select-collateral" className="btn-neo bg-white">
            Browse Collateral
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {positions.map((position) => {
            const nft = getNFTById(position.nftId)
            return (
              <div key={position.id} className="card-neo bg-white hover:shadow-neo-lg transition-shadow">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* NFT Image */}
                  <div className="w-full lg:w-48 aspect-square bg-gray-200 border-2 border-black flex-shrink-0">
                    <img 
                      src={nft?.imageUrl} 
                      alt={nft?.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-black uppercase">{nft?.name || 'Unknown NFT'}</h3>
                        <span className={`
                          px-2 py-0.5 text-xs font-bold uppercase text-white bg-black
                        `}>
                          {position.status}
                        </span>
                      </div>
                      <div className="text-right">
                         <p className="text-sm font-bold text-gray-500 uppercase">Remaining Debt</p>
                         <p className="text-3xl font-black text-neo-red">${position.remainingDebt.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between font-bold text-sm">
                        <span>Repayment Progress</span>
                        <span>{position.repaymentProgress.toFixed(1)}%</span>
                      </div>
                      <div className="h-8 bg-gray-200 border-2 border-black relative">
                        <div 
                          className="h-full bg-neo-green border-r-2 border-black transition-all duration-1000"
                          style={{ width: `${position.repaymentProgress}%` }}
                        />
                        <div className="absolute top-0 right-0 h-full flex items-center px-2 text-xs font-bold opacity-50">
                          Target: 65 Weeks
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t-2 border-gray-100">
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">Initial Loan</p>
                        <p className="font-black">${position.loanAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">Collateral Value</p>
                        <p className="font-black">${position.collateralValue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">Yield Generated</p>
                        <p className="font-black text-neo-blue">${position.yieldGenerated.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">Time Elapsed</p>
                        <p className="font-black">{position.currentWeek} / {position.totalWeeks} Wks</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col gap-2 justify-center lg:w-48 lg:border-l-2 lg:border-gray-100 lg:pl-6">
                    <Link to={`/borrower/${position.nftId}`} className="btn-neo text-sm w-full bg-white hover:bg-gray-50 text-center">
                      View Details
                    </Link>
                    {position.status === 'completed' && (
                       <Link to={`/borrower/${position.nftId}`} className="btn-primary text-sm w-full flex items-center justify-center gap-1 text-center">
                         Withdraw NFT <ArrowUpRight size={16} />
                       </Link>
                    )}
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
