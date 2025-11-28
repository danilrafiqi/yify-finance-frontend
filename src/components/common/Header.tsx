import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import NetworkSwitcher from './NetworkSwitcher'
import WalletConnection from './WalletConnection'

const Header: React.FC = () => {
  const location = useLocation()
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path)
  }

  return (
    <header className="bg-neo-white border-b-4 border-black sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-neo-yellow border-2 border-black p-1 group-hover:rotate-3 transition-transform">
              <span className="text-2xl font-black tracking-tighter">YIFY</span>
            </div>
            <span className="font-bold text-sm hidden sm:block">LENDING</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/borrower/dashboard" 
              className={`font-bold uppercase tracking-wide hover:text-neo-blue transition-colors ${isActive('/borrower') ? 'underline decoration-4 decoration-neo-blue' : ''}`}
            >
              Borrow
            </Link>
            <Link 
              to="/lender/dashboard" 
              className={`font-bold uppercase tracking-wide hover:text-neo-green transition-colors ${isActive('/lender') ? 'underline decoration-4 decoration-neo-green' : ''}`}
            >
              Lend
            </Link>
            <Link 
              to="/help" 
              className={`font-bold uppercase tracking-wide hover:text-neo-magenta transition-colors ${isActive('/help') ? 'underline decoration-4 decoration-neo-magenta' : ''}`}
            >
              Help
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <NetworkSwitcher />
            <WalletConnection />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

