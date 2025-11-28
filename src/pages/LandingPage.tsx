import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, ShieldCheck, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { usePlatformStatsStore } from '../stores/platformStatsStore'

const LandingPage: React.FC = () => {
  const { tvl, totalLoans, activeUsers, totalBorrow, availableFund } = usePlatformStatsStore()

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-8 px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block bg-neo-yellow border-4 border-black p-8 shadow-neo-lg rotate-[-2deg]"
        >
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
            YIFY
            <span className="block text-2xl md:text-4xl mt-2 bg-black text-white p-2 rotate-[2deg]">
              LENDING PROTOCOL
            </span>
          </h1>
        </motion.div>

        <p className="text-xl md:text-2xl font-bold max-w-2xl mx-auto mt-8">
          Borrow against your veNFTs & RWA with <span className="bg-neo-green px-2">Zero Interest</span>.
          <br />
          Repay automatically with yield.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6 mt-8">
          <Link to="/borrower/select-collateral" className="btn-primary text-xl flex items-center justify-center gap-2">
            Borrow Now <ArrowRight strokeWidth={3} />
          </Link>
          <Link to="/lender/deposit" className="btn-secondary text-xl flex items-center justify-center gap-2">
            Start Lending <TrendingUp strokeWidth={3} />
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
        <div className="card-neo bg-neo-red text-white hover:rotate-1 transition-transform">
          <h3 className="text-xl font-bold uppercase mb-2">Total Value Locked</h3>
          <p className="text-3xl font-black">${(tvl / 1000000).toFixed(2)}M</p>
        </div>
        <div className="card-neo bg-neo-yellow text-black hover:-rotate-1 transition-transform">
          <h3 className="text-xl font-bold uppercase mb-2">Total Borrow</h3>
          <p className="text-3xl font-black">${(totalBorrow / 1000000).toFixed(2)}M</p>
        </div>
        <div className="card-neo bg-neo-lime text-black hover:rotate-1 transition-transform">
          <h3 className="text-xl font-bold uppercase mb-2">Available Fund</h3>
          <p className="text-3xl font-black">${(availableFund / 1000000).toFixed(2)}M</p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-black text-white flex items-center justify-center border-4 border-neo-yellow shadow-neo">
            <Zap size={32} />
          </div>
          <h3 className="text-2xl font-black uppercase">Self-Repaying</h3>
          <p className="font-bold text-gray-700">
            Your collateral generates yield that automatically repays your loan over time.
          </p>
        </div>
        <div className="space-y-4">
          <div className="w-16 h-16 bg-black text-white flex items-center justify-center border-4 border-neo-cyan shadow-neo">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-2xl font-black uppercase">No Liquidation</h3>
          <p className="font-bold text-gray-700">
            Safe LTV ratios ensure your assets are never liquidated during market volatility.
          </p>
        </div>
        <div className="space-y-4">
          <div className="w-16 h-16 bg-black text-white flex items-center justify-center border-4 border-neo-lime shadow-neo">
            <TrendingUp size={32} />
          </div>
          <h3 className="text-2xl font-black uppercase">High LTV</h3>
          <p className="font-bold text-gray-700">
            Get up to 50% LTV on your veNFTs and RWA tokens instantly.
          </p>
        </div>
      </section>

      {/* Networks */}
      <section className="text-center py-12 bg-white border-y-4 border-black">
        <h2 className="text-3xl font-black uppercase mb-8">Supported Networks</h2>
        <div className="flex justify-center gap-4 flex-wrap">
          <span className="px-6 py-2 bg-neo-red border-4 border-black shadow-neo font-bold text-white uppercase">Optimism</span>
          <span className="px-6 py-2 bg-neo-blue border-4 border-black shadow-neo font-bold text-black uppercase">Base</span>
          <span className="px-6 py-2 bg-purple-600 border-4 border-black shadow-neo font-bold text-white uppercase">Ethereum</span>
        </div>
      </section>
    </div>
  )
}

export default LandingPage

