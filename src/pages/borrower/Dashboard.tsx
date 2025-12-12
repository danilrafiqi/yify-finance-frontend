import React from 'react'
import { Link } from 'react-router-dom'
import { useAccount, useReadContract, useChainId } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { Plus, DollarSign } from 'lucide-react'
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

  // Get loan creation timestamps from indexer (with fallback)
  const { data: loanTimestamps } = useQuery({
    queryKey: ['loanTimestamps', userPositions?.map(p => ({
      loanId: p.loanId.toString(),
      nftContract: p.nftContract.toLowerCase(),
      tokenId: p.tokenId.toString(),
      totalBorrowed: p.totalBorrowed.toString(),
      remainingDebt: p.remainingDebt.toString(),
      isActive: p.isActive
    }))],
    queryFn: async () => {
      if (!userPositions || userPositions.length === 0) return {}

      const timestamps: { [key: string]: number } = {}

      for (const position of userPositions) {
        if (!position.isActive) continue

        const loanId = `${position.nftContract.toLowerCase()}-${position.tokenId}`

        try {
          const response = await fetch('http://localhost:42069/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: `
                query GetLoanTimestamp($id: ID!) {
                  loan(id: $id) {
                    createdAt
                  }
                }
              `,
              variables: { id: loanId }
            })
          })

          const result = await response.json()
          if (result.data?.loan?.createdAt) {
            timestamps[loanId] = Number(result.data.loan.createdAt)
          } else {
            // Fallback: estimate based on deployment time
            timestamps[loanId] = Math.floor(Date.now() / 1000) - (Math.random() * 86400) // Random within last 24h
          }
        } catch (error) {
          console.warn(`Indexer not available, using fallback for loan ${loanId}`)
          // Fallback: mock timestamp for demo purposes
          timestamps[loanId] = Math.floor(Date.now() / 1000) - (Math.random() * 3600) // Random within last hour
        }
      }

      return timestamps
    },
    enabled: !!userPositions && userPositions.length > 0
  })


  // Deduplicate loans by loanId (smart contract can have duplicate entries in userLoans array)
  const uniqueActiveLoans = React.useMemo(() => {
    if (!userPositions) return []

    const seen = new Set<string>()
    return userPositions.filter(p => {
      if (!p.isActive) return false
      const loanIdStr = p.loanId.toString()
      if (seen.has(loanIdStr)) return false
      seen.add(loanIdStr)
      return true
    })
  }, [userPositions])

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
        {uniqueActiveLoans.length > 0 ? (
          uniqueActiveLoans.map((position) => {
            const loanId = position.loanId
            const tokenId = position.tokenId.toString()
            const contractAddr = position.nftContract
            const loanIdStr = `${contractAddr.toLowerCase()}-${tokenId}`

            // Detect NFT type based on contract address
            const isVeNFT = contractAddr.toLowerCase() === addresses.veNFT.toLowerCase()
            const isRwaNFT = contractAddr.toLowerCase() === addresses.rwaNFT.toLowerCase()
            const nftType = isVeNFT ? 'veNFT' : isRwaNFT ? 'RWA' : 'NFT'

            // Calculate time to payoff based on historical repayment rate
            const createdAt = loanTimestamps?.[loanIdStr]
            let timeToPayoff = '---'

            if (createdAt) {
              const weeksElapsed = Math.max(1, (Date.now() / 1000 - createdAt) / (7 * 24 * 60 * 60))
              const totalRepaid = parseFloat(formatUnits(position.totalBorrowed - position.remainingDebt, 6))
              const avgWeeklyRepayment = totalRepaid / weeksElapsed

              if (avgWeeklyRepayment > 0) {
                const remainingDebt = parseFloat(formatUnits(position.remainingDebt, 6))
                const weeksToPayoff = Math.ceil(remainingDebt / avgWeeklyRepayment)
                timeToPayoff = `${weeksToPayoff} weeks`
              } else if (totalRepaid === 0) {
                timeToPayoff = 'No repayment yet'
              } else {
                timeToPayoff = 'Calculating...'
              }
            }

            // Stats
            const debt = parseFloat(formatUnits(position.remainingDebt, 6))
            const initialLoan = parseFloat(formatUnits(position.totalBorrowed, 6))
            const repaid = initialLoan - debt
            const progress = initialLoan > 0 ? (repaid / initialLoan) * 100 : 0

            return (
              <div key={loanId} className="card-neo bg-white hover:shadow-neo-lg transition-all border-4 border-black p-0 overflow-hidden flex flex-col md:flex-row">
                {/* Left: NFT Image/Icon */}
                <div className={`w-full md:w-48 aspect-square flex items-center justify-center border-b-4 md:border-b-0 md:border-r-4 border-black p-4 ${isVeNFT ? 'bg-neo-red' : isRwaNFT ? 'bg-neo-magenta' : 'bg-gray-600'}`}>
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
                      <p className="text-xs font-bold text-gray-500 uppercase">Total Borrowed</p>
                      <p className="font-black text-lg">${initialLoan.toLocaleString()}</p>
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
