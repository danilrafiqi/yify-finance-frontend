import { Routes, Route } from 'react-router-dom'
import Header from './shared/components/Header'
import NotificationSystem from './shared/components/NotificationSystem'

// Pages
import LandingPage from './modules/landing/pages/LandingPage'
import HelpFAQ from './modules/help/pages/HelpFAQ'
import BorrowerDashboard from './modules/borrow/pages/Dashboard'
import BorrowerDetail from './modules/borrow/pages/BorrowerDetail'
import CollateralSelection from './modules/borrow/pages/CollateralSelection'
import LoanCalculator from './modules/borrow/pages/LoanCalculator'
import LenderDashboard from './modules/lend/pages/Dashboard'
import LenderDeposit from './modules/lend/pages/Deposit'
import AdminPage from './modules/admin/pages/Admin'

function AppContent() {
  return (
    <div className="min-h-screen bg-neo-white flex flex-col font-body">
      <NotificationSystem />
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/help" element={<HelpFAQ />} />

          {/* Borrower Flow */}
          <Route path="/borrower/dashboard" element={<BorrowerDashboard />} />
          <Route path="/borrower/:idnft" element={<BorrowerDetail />} />
          <Route path="/borrower/select-collateral" element={<CollateralSelection />} />
          <Route path="/borrower/calculator" element={<LoanCalculator />} />

          {/* Lender Flow */}
          <Route path="/lender/dashboard" element={<LenderDashboard />} />
          <Route path="/lender/deposit" element={<LenderDeposit />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>

      <footer className="bg-black text-white py-8 border-t-4 border-neo-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-bold uppercase">© 2025 YIFY Lending Protocol. All rights reserved.</p>
          <p className="text-sm mt-2 text-gray-400">Mock Environment for Development</p>
        </div>
      </footer>
    </div>
  )
}

export default AppContent
