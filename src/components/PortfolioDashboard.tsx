import React from 'react'
import { useNavigate } from 'react-router-dom'
import { usePositionStore } from '../stores/positionStore'
import { useNFTStore } from '../stores/nftStore'
import { useTransactionStore } from '../stores/transactionStore'


// Simple Yield Chart Component
const YieldChart: React.FC<{ positions: any[] }> = () => {
  // Generate mock yield data for the last 4 weeks (28 days) - matches veNFT epoch cycle
  const generateYieldData = () => {
    const data = []
    let cumulativeYield = 0

    // Weekly epochs for veNFT (4 weeks)
    for (let week = 3; week >= 0; week--) {
      // Simulate weekly yield growth (0.7% to 3.5% weekly for veNFT)
      const weeklyYield = Math.random() * 0.028 + 0.007 // 0.7% to 3.5% weekly
      cumulativeYield += weeklyYield

      data.push({
        epoch: `Week ${4 - week}`,
        yield: cumulativeYield * 100, // Convert to percentage
        date: new Date(Date.now() - week * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        type: 'Weekly (veAero)'
      })
    }

    return data
  }

  const yieldData = generateYieldData()
  const maxYield = Math.max(...yieldData.map(d => d.yield))
  const chartWidth = 600
  const chartHeight = 200
  const padding = 40

  // Create path for the line chart
  const points = yieldData.map((data, index) => {
    const x = padding + (index / (yieldData.length - 1)) * (chartWidth - 2 * padding)
    const y = chartHeight - padding - (data.yield / maxYield) * (chartHeight - 2 * padding)
    return `${x},${y}`
  }).join(' ')

  // Create area fill
  const areaPoints = `0,${chartHeight} ${points} ${chartWidth},${chartHeight}`

  return (
    <div className="w-full h-full overflow-x-auto">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        preserveAspectRatio="xMidYMid meet"
        className="min-w-full"
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="50" height="20" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Area fill */}
        <polygon
          points={areaPoints}
          fill="url(#gradient)"
          opacity="0.3"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.1"/>
          </linearGradient>
        </defs>

        {/* Line chart */}
        <polyline
          points={points}
          fill="none"
          stroke="#22c55e"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {yieldData.map((data, index) => {
          const x = padding + (index / (yieldData.length - 1)) * (chartWidth - 2 * padding)
          const y = chartHeight - padding - (data.yield / maxYield) * (chartHeight - 2 * padding)

          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="#22c55e"
              stroke="#ffffff"
              strokeWidth="2"
            />
          )
        })}

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <g key={index}>
            <text
              x="10"
              y={chartHeight - padding - ratio * (chartHeight - 2 * padding)}
              textAnchor="start"
              fontSize="12"
              fill="#6b7280"
            >
              {(maxYield * ratio).toFixed(1)}%
            </text>
            <line
              x1="35"
              y1={chartHeight - padding - ratio * (chartHeight - 2 * padding)}
              x2={chartWidth - padding}
              y2={chartHeight - padding - ratio * (chartHeight - 2 * padding)}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          </g>
        ))}

        {/* X-axis labels */}
        {[0, 1, 2, 3].map((week) => (
          <text
            key={week}
            x={padding + (week / 3) * (chartWidth - 2 * padding)}
            y={chartHeight - 10}
            textAnchor="middle"
            fontSize="12"
            fill="#6b7280"
          >
            Week {week + 1}
          </text>
        ))}
      </svg>

      {/* Chart Summary */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm text-gray-600">Current Yield</p>
          <p className="text-lg font-semibold text-green-600">
            {yieldData[yieldData.length - 1]?.yield.toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">4-Week Growth</p>
          <p className="text-lg font-semibold text-blue-600">
            +{(yieldData[yieldData.length - 1]?.yield - yieldData[0]?.yield).toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Avg Weekly</p>
          <p className="text-lg font-semibold text-purple-600">
            {(yieldData[yieldData.length - 1]?.yield / 4).toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Epoch Timing Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Epoch Timing:</strong> veNFT (weekly) • RWA NFTs (monthly)
          <br />
          <em>Chart shows 4-week veNFT cycle • Next yield distribution in ~30 seconds</em>
        </p>
      </div>
    </div>
  )
}

const PortfolioDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { getActivePositions, closePosition, getWeightedLTV } = usePositionStore()
  const { getNFTsByPosition, withdrawNFTs } = useNFTStore()
  const { addTransaction, transactions } = useTransactionStore()

  // Get all active positions (isolated positions for each NFT)
  const activePositions = getActivePositions()

  // Get borrow history
  const borrowTransactions = transactions
    .filter(tx => tx.type === 'borrow')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Get all collateral NFTs (both isolated and borrow positions)
  const allCollateralNFTs = activePositions.flatMap(pos => {
    const collateralNFTs = getNFTsByPosition(pos.id)

    if (pos.id.startsWith('pos-')) {
      // Isolated position - single NFT
      const nft = collateralNFTs[0]
      return [{
        id: pos.id,
        nftId: pos.collateralNFTs[0],
        name: nft?.name || 'Unknown NFT',
        value: pos.totalCollateralValue,
        ltv: nft?.ltv || 60,
        position: pos,
        positionType: 'isolated'
      }]
    } else if (pos.id.startsWith('borrow-')) {
      // Borrow position - multiple NFTs in shared pool
      return collateralNFTs.map(nft => ({
        id: pos.id,
        nftId: nft.id,
        name: nft.name,
        value: nft.floorPrice || 0,
        ltv: nft.ltv || 60,
        position: pos,
        positionType: 'borrow'
      }))
    }
    return []
  })

  // Get total borrowed amount across all borrow positions
  const totalBorrowed = activePositions
    .filter(pos => pos.id.startsWith('borrow-'))
    .reduce((sum, pos) => sum + pos.borrowedAmount, 0)

  // Calculate if each NFT can be withdrawn
  const collateralList = allCollateralNFTs.map(nft => {
    if (totalBorrowed === 0) {
      // No debt, all NFTs can be withdrawn
      return { ...nft, canWithdraw: true }
    }

    // Calculate remaining collateral value if this NFT is removed
    const totalCollateralValue = allCollateralNFTs.reduce((sum, n) => sum + n.value, 0)
    const remainingValue = totalCollateralValue - nft.value
    const maxBorrowAfterWithdraw = remainingValue * (getWeightedLTV() / 100)

    // Can withdraw if remaining collateral > total borrowed and doesn't violate LTV
    const canWithdraw = remainingValue > totalBorrowed && maxBorrowAfterWithdraw >= totalBorrowed

    return {
      ...nft,
      canWithdraw,
      remainingValue,
      maxBorrowAfterWithdraw
    }
  })

  const totalStats = {
    totalCollateral: collateralList.reduce((sum, nft) => sum + nft.value, 0),
    totalBorrowed: totalBorrowed,
    totalEarned: collateralList.reduce((sum, nft) => sum + nft.position.yieldEarned, 0),
    totalYieldShared: collateralList.reduce((sum, nft) => sum + (nft.position.yieldShared || 0), 0)
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Portfolio Dashboard</h2>
        <button
          onClick={() => {
            // Mock export functionality
            alert('📊 Portfolio report exported!\n\nIn a real app, this would download a PDF/CSV with your lending activity.')
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Export Report
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Collateral</h3>
          <p className="text-2xl font-bold text-gray-900">${totalStats.totalCollateral.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{collateralList.length} NFTs</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Borrowed</h3>
          <p className="text-2xl font-bold text-gray-900">${totalStats.totalBorrowed.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">USDC</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Yield Earned</h3>
          <p className="text-2xl font-bold text-green-600">${totalStats.totalEarned.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">From NFT yields</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Yield Shared</h3>
          <p className="text-2xl font-bold text-blue-600">${totalStats.totalYieldShared.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">With lenders (20%)</p>
        </div>
      </div>

      {/* Positions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Your Collateral</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NFT Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LTV
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {collateralList.map((nft) => (
                <tr key={`${nft.id}-${nft.nftId}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{nft.name}</div>
                    <div className="text-xs text-gray-500">ID: {nft.nftId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${nft.value.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {nft.ltv}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {nft.canWithdraw ? (
                      <button
                        onClick={() => {
                          const confirmMessage = `Withdraw "${nft.name}" from collateral? This will reduce your borrowing power.`

                          if (confirm(confirmMessage)) {
                            if (nft.positionType === 'borrow') {
                              // For shared collateral, just withdraw the NFT
                              withdrawNFTs([nft.nftId])
                              addTransaction({
                                type: 'withdraw',
                                amount: 0,
                                token: 'NFT',
                                status: 'confirmed',
                                positionId: nft.id,
                                description: `Withdrew NFT "${nft.name}" from shared collateral`
                              })
                              alert(`NFT "${nft.name}" withdrawn from collateral`)
                            } else {
                              // For isolated position, close the position and withdraw
                              closePosition(nft.id)
                              withdrawNFTs([nft.nftId])
                              addTransaction({
                                type: 'withdraw',
                                amount: 0,
                                token: 'NFT',
                                status: 'confirmed',
                                positionId: nft.id,
                                description: `Withdrew NFT "${nft.name}" from isolated position`
                              })
                              alert(`NFT "${nft.name}" withdrawn from collateral`)
                            }
                          }
                        }}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        Withdraw
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">Locked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Borrow History */}
      {borrowTransactions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Borrow History</h3>
            <p className="text-sm text-gray-600 mt-1">Track all your borrowing activity</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {borrowTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.timestamp).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">
                        +${transaction.amount.toLocaleString()} USDC
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {transaction.description}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Yield Performance Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Yield Performance (4 Weeks - veNFT Cycle)</h3>
        <div className="h-64">
          <YieldChart positions={collateralList.map(nft => ({
            id: nft.id,
            collateralNFTs: [nft.name],
            totalCollateralValue: nft.value,
            borrowedAmount: nft.position.borrowedAmount,
            yieldEarned: nft.position.yieldEarned,
            autoRepaymentProgress: nft.position.autoRepaymentProgress,
            estimatedPayoff: 'N/A',
            totalYieldShared: nft.position.yieldShared || 0,
            weightedLTV: nft.ltv
          }))} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/borrow')}
            className="bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700"
          >
            Borrow More
          </button>
          <button
            onClick={() => navigate('/repay')}
            className="bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700"
          >
            Repay Debt
          </button>
          <button
            onClick={() => navigate('/deposit')}
            className="bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700"
          >
            Add Collateral
          </button>
        </div>
      </div>
    </div>
  )
}

export default PortfolioDashboard
