import React from 'react'
import { Link } from 'react-router-dom'

interface LendingPool {
  id: string
  asset: string
  symbol: string
  depositAPY: number
  totalDeposits: number
  utilization: number
  icon: string
  description: string
}

const LendingMarkets: React.FC = () => {
  // Mock lending pools data
  const lendingPools: LendingPool[] = [
    {
      id: 'usdc-pool',
      asset: 'USD Coin',
      symbol: 'USDC',
      depositAPY: 8.5,
      totalDeposits: 1250000,
      utilization: 75,
      icon: '💰',
      description: 'Stablecoin lending pool for USDC deposits'
    },
    {
      id: 'usdt-pool',
      asset: 'Tether',
      symbol: 'USDT',
      depositAPY: 8.2,
      totalDeposits: 850000,
      utilization: 68,
      icon: '💵',
      description: 'Stablecoin lending pool for USDT deposits'
    },
    {
      id: 'dai-pool',
      asset: 'Dai',
      symbol: 'DAI',
      depositAPY: 7.9,
      totalDeposits: 650000,
      utilization: 82,
      icon: '💎',
      description: 'Stablecoin lending pool for DAI deposits'
    },
    {
      id: 'aero-pool',
      asset: 'Aerodrome',
      symbol: 'AERO',
      depositAPY: 12.3,
      totalDeposits: 320000,
      utilization: 45,
      icon: '🚀',
      description: 'Aerodrome token lending pool'
    }
  ]

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return 'text-red-600 bg-red-50'
    if (utilization >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  return (
    <div className="space-y-6">
      {/* Markets Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Available Lending Markets</h2>
        <p className="text-gray-600 mb-6">
          Deposit your assets into these pools to earn interest. Higher utilization rates typically mean higher yields.
        </p>

        {/* Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Total Deposits</div>
            <div className="text-2xl font-bold text-green-800">$2.4M</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Active Lenders</div>
            <div className="text-2xl font-bold text-blue-800">1,247</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Avg APY</div>
            <div className="text-2xl font-bold text-purple-800">9.2%</div>
          </div>
        </div>
      </div>

      {/* Lending Pools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lendingPools.map((pool) => (
          <div key={pool.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Pool Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{pool.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{pool.asset}</h3>
                    <p className="text-sm text-gray-500">{pool.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{pool.depositAPY}%</div>
                  <div className="text-xs text-gray-500">APY</div>
                </div>
              </div>

              {/* Pool Stats */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Deposits</span>
                  <span className="font-medium">${pool.totalDeposits.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Utilization</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getUtilizationColor(pool.utilization)}`}>
                    {pool.utilization}%
                  </span>
                </div>
              </div>

              {/* Utilization Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Pool Utilization</span>
                  <span>{pool.utilization}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      pool.utilization >= 80 ? 'bg-red-500' :
                      pool.utilization >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${pool.utilization}%` }}
                  ></div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">{pool.description}</p>

              {/* Action Button */}
              <Link
                to={`/lender/deposit?pool=${pool.id}`}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors text-center block"
              >
                Deposit {pool.symbol}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600">ℹ️</div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">How Lending Works</h4>
            <p className="text-sm text-blue-700">
              When you deposit assets into lending pools, borrowers can borrow them using NFT collateral.
              You earn interest from the borrowing fees, and your funds remain liquid - you can withdraw at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LendingMarkets
