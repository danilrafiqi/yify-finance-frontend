import React from 'react'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'

// Import Zustand stores
import { useWalletStore } from './stores/walletStore'
import { usePositionStore } from './stores/positionStore'
import { useNFTStore } from './stores/nftStore'

// Components
import WalletConnection from './components/WalletConnection'
import NFTGallery from './components/NFTGallery'
import DepositInterface from './components/DepositInterface'
import BorrowInterface from './components/BorrowInterface'
import PortfolioDashboard from './components/PortfolioDashboard'
import RepayInterface from './components/RepayInterface'
import PositionManagement from './components/PositionManagement'
import LenderMenu from './components/LenderMenu'

// Protected Route Component
function ProtectedRoute({ children, requiresWallet = true }: { children: React.ReactNode, requiresWallet?: boolean }) {
  const { isConnected } = useWalletStore()

  if (requiresWallet && !isConnected) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function AppContent() {
  const { isConnected } = useWalletStore()
  const location = useLocation()

  // Simulate epoch-based yield distribution
  // veNFT: weekly (7 days), NFT RWA: monthly (30 days)
  const { simulateAutoRepayment } = usePositionStore()
  const { simulateYieldGrowth } = useNFTStore()
  React.useEffect(() => {
    if (!isConnected) return

    // Simulate weekly epoch for veNFT (every 30 seconds for demo)
    const weeklyInterval = setInterval(() => {
      simulateYieldGrowth('veNFT') // Weekly yield for veNFT
      simulateAutoRepayment('veNFT') // Weekly auto-repayment
    }, 30000) // 30 seconds = 1 week in demo time

    // Simulate monthly epoch for RWA NFTs (every 2 minutes for demo)
    const monthlyInterval = setInterval(() => {
      simulateYieldGrowth('rwa') // Monthly yield for RWA NFTs
      simulateAutoRepayment('rwa') // Monthly auto-repayment
    }, 120000) // 2 minutes = 1 month in demo time

    return () => {
      clearInterval(weeklyInterval)
      clearInterval(monthlyInterval)
    }
  }, [isConnected, simulateAutoRepayment, simulateYieldGrowth])

  const navigationItems = [
    { path: '/', label: 'Connect', requiresWallet: false },
    { path: '/nfts', label: 'NFTs', requiresWallet: true },
    { path: '/deposit', label: 'Deposit', requiresWallet: true },
    { path: '/borrow', label: 'Borrow', requiresWallet: true },
    { path: '/dashboard', label: 'Dashboard', requiresWallet: true },
    { path: '/repay', label: 'Repay', requiresWallet: true },
    { path: '/manage', label: 'Manage', requiresWallet: true },
    { path: '/lender', label: '🏦 Lender', requiresWallet: true },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">YIFY</h1>
              <span className="ml-2 text-sm text-gray-500">YIFY Finance - veNFT & NFT RWA</span>
              <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                MOCK
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                const isAccessible = !item.requiresWallet || isConnected

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : isAccessible
                        ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        : 'text-gray-400 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 overflow-auto">
        <Routes>
          <Route path="/" element={<WalletConnection />} />
          <Route path="/nfts" element={
            <ProtectedRoute>
              <NFTGallery />
            </ProtectedRoute>
          } />
          <Route path="/deposit" element={
            <ProtectedRoute>
              <DepositInterface />
            </ProtectedRoute>
          } />
          <Route path="/borrow" element={
            <ProtectedRoute>
              <BorrowInterface />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <PortfolioDashboard />
            </ProtectedRoute>
          } />
          <Route path="/repay" element={
            <ProtectedRoute>
              <RepayInterface />
            </ProtectedRoute>
          } />
          <Route path="/manage" element={
            <ProtectedRoute>
              <PositionManagement />
            </ProtectedRoute>
          } />
          <Route path="/lender" element={
            <ProtectedRoute>
              <LenderMenu />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      {/* Mock Environment Banner */}
      <div className="bg-yellow-400 text-yellow-900 px-4 py-2 text-center text-sm">
        🧪 <strong>Mock Environment:</strong> All data is simulated for development. No real transactions occur.
      </div>
    </div>
  )
}

// Main App - Zustand handles state persistence
export default AppContent
