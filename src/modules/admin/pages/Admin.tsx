// pages/admin/Admin.tsx
// REFACTORED - Menggunakan viewmodel pattern
import React from 'react'
import { Settings, Zap, Coins, Database, Info, Loader2, DollarSign } from 'lucide-react'
import { formatUnits } from 'viem'
import { useChainId } from 'wagmi'

import { useAdminViewModel } from '../viewmodels/admin.viewmodel'

const AdminPage: React.FC = () => {
  const chainId = useChainId()
  const viewModel = useAdminViewModel()

  const {
    tvl,
    totalBorrow,
    availableFund,
    usdcBalance,
    globalYieldAmount,
    setGlobalYieldAmount,
    specificYieldAmount,
    setSpecificYieldAmount,
    specificNFTAddress,
    setSpecificNFTAddress,
    specificTokenId,
    setSpecificTokenId,
    processYieldNFT,
    setProcessYieldNFT,
    processYieldTokenId,
    setProcessYieldTokenId,
    mintUSDCAmount,
    setMintUSDCAmount,
    nftPrice,
    setNftPrice,
    nftType,
    setNftType,
    mintUSDC,
    isGeneratingGlobalYield,
    isSimulatingYield,
    isProcessingYield,
    isMintingUSDC,
    isMintingNFT,
    adminAddresses,
    addresses,
    handleGlobalYield,
    handleSpecificYield,
    handleProcessYield,
    handleMintUSDC,
    handleMintNFT,
    isLoading
  } = viewModel

  const isLocalChain = chainId === 31337

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase flex items-center gap-4">
          <Settings size={40} />
          Admin Operations
        </h1>
        <p className="font-bold text-gray-600 mt-2">Development & Testing Tools</p>
      </div>

      {/* Contract Info */}
      <div className="card-neo bg-black text-white">
        <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
          <Info size={24} />
          Contract Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-sm">
          <div>
            <p className="text-gray-400">Lending Pool</p>
            <p className="text-neo-cyan">{addresses.lendingPool}</p>
          </div>
          <div>
            <p className="text-gray-400">Loan Manager</p>
            <p className="text-neo-cyan">{addresses.loanManager}</p>
          </div>
          <div>
            <p className="text-gray-400">USDC</p>
            <p className="text-neo-yellow">{addresses.usdc}</p>
          </div>
          <div>
            <p className="text-gray-400">veNFT</p>
            <p className="text-neo-magenta">{addresses.veNFT}</p>
          </div>
          <div>
            <p className="text-gray-400">RWA NFT</p>
            <p className="text-neo-magenta">{addresses.rwaNFT}</p>
          </div>
          <div>
            <p className="text-gray-400">Yield Generator</p>
            <p className="text-neo-green">{adminAddresses?.yieldGenerator || 'N/A'}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t-2 border-white grid grid-cols-3 gap-4">
          <div>
            <p className="text-gray-400 text-sm">TVL</p>
            <p className="text-2xl font-black">${parseFloat(formatUnits(tvl, 6)).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Borrow</p>
            <p className="text-2xl font-black">${parseFloat(formatUnits(totalBorrow, 6)).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Available</p>
            <p className="text-2xl font-black">${parseFloat(formatUnits(availableFund, 6)).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Yield Operations */}
        <div className="card-neo bg-neo-green text-black">
          <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
            <Zap size={24} />
            Yield Operations
          </h2>

          <form onSubmit={handleGlobalYield} className="space-y-4 mb-6 pb-6 border-b-4 border-black">
            <h3 className="font-black uppercase">Simulate Global Yield</h3>
            <p className="text-sm font-bold">Add yield to ALL registered NFTs</p>
            <input
              type="number"
              placeholder="Amount (USDC)"
              value={globalYieldAmount}
              onChange={(e) => setGlobalYieldAmount(e.target.value)}
              className="input-neo"
              step="0.01"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !globalYieldAmount}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isGeneratingGlobalYield ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
              Simulate Global Yield
            </button>
          </form>

          <form onSubmit={handleSpecificYield} className="space-y-4 mb-6 pb-6 border-b-4 border-black">
            <h3 className="font-black uppercase">Simulate Specific Yield</h3>
            <p className="text-sm font-bold">Add yield to a specific NFT</p>
            <select
              value={specificNFTAddress}
              onChange={(e) => setSpecificNFTAddress(e.target.value)}
              className="input-neo"
              disabled={isLoading}
            >
              <option value={addresses.veNFT}>veNFT</option>
              <option value={addresses.rwaNFT}>RWA NFT</option>
            </select>
            <input
              type="number"
              placeholder="Token ID"
              value={specificTokenId}
              onChange={(e) => setSpecificTokenId(e.target.value)}
              className="input-neo"
              disabled={isLoading}
            />
            <input
              type="number"
              placeholder="Amount (USDC)"
              value={specificYieldAmount}
              onChange={(e) => setSpecificYieldAmount(e.target.value)}
              className="input-neo"
              step="0.01"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !specificYieldAmount || !specificTokenId}
              className="btn-neo bg-black text-white w-full flex items-center justify-center gap-2"
            >
              {isSimulatingYield ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
              Simulate Specific Yield
            </button>
          </form>

          <form onSubmit={handleProcessYield} className="space-y-4">
            <h3 className="font-black uppercase">Process Yield Distribution</h3>
            <p className="text-sm font-bold">Trigger `claimAndDistribute` for an NFT</p>
            <select
              value={processYieldNFT}
              onChange={(e) => setProcessYieldNFT(e.target.value)}
              className="input-neo"
              disabled={isLoading}
            >
              <option value={addresses.veNFT}>veNFT</option>
              <option value={addresses.rwaNFT}>RWA NFT</option>
            </select>
            <input
              type="number"
              placeholder="Token ID"
              value={processYieldTokenId}
              onChange={(e) => setProcessYieldTokenId(e.target.value)}
              className="input-neo"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !processYieldTokenId}
              className="btn-neo bg-black text-white w-full flex items-center justify-center gap-2"
            >
              {isProcessingYield ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
              Process Yield on Distributor
            </button>
          </form>
        </div>

        {/* NFT Operations */}
        <div className="card-neo bg-neo-blue text-white">
          <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
            <Coins size={24} />
            NFT Operations
          </h2>

          <form onSubmit={handleMintNFT} className="space-y-4">
            <h3 className="font-black uppercase">Mint NFT with Price</h3>
            <p className="text-sm font-bold text-blue-100">Mint NFT and set its collateral value</p>

            <div>
              <label className="block text-sm font-bold text-white mb-2">NFT Type</label>
              <select
                value={nftType}
                onChange={(e) => setNftType(e.target.value as 'veNFT' | 'rwaNFT')}
                className="input-neo bg-white text-black"
                disabled={isLoading}
              >
                <option value="veNFT">veNFT</option>
                <option value="rwaNFT">RWA NFT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Set Value ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 text-gray-500" size={16} />
                <input
                  type="number"
                  placeholder="e.g. 20000"
                  value={nftPrice}
                  onChange={(e) => setNftPrice(e.target.value)}
                  className="input-neo bg-white text-black pl-10"
                  step="0.01"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !nftPrice}
              className="btn-neo bg-white text-black w-full flex items-center justify-center gap-2"
            >
              {isMintingNFT ? <Loader2 className="animate-spin" size={20} /> : <Coins size={20} />}
              Mint {nftType} & Set Price
            </button>

            <p className="text-xs text-blue-200">
              1. Mint NFT to your wallet → 2. Set collateral value in oracle
            </p>
          </form>
        </div>

        {/* Liquidity Operations */}
        <div className="card-neo bg-neo-yellow text-black lg:col-span-2">
          <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
            <Database size={24} />
            Liquidity Operations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form onSubmit={handleMintUSDC} className="space-y-4">
              <h3 className="font-black uppercase">Mint USDC</h3>
              <p className="text-sm font-bold">Mint test USDC to your wallet</p>
              <div className="bg-white border-2 border-black p-3">
                <p className="text-xs font-bold text-gray-500">Your USDC Balance</p>
                <p className="text-2xl font-black">
                  {usdcBalance.toLocaleString()} USDC
                </p>
              </div>
              <input
                type="number"
                placeholder="Amount (USDC)"
                value={mintUSDCAmount}
                onChange={(e) => setMintUSDCAmount(e.target.value)}
                className="input-neo"
                step="0.01"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !mintUSDCAmount}
                className="btn-neo bg-black text-white w-full flex items-center justify-center gap-2"
              >
                {isMintingUSDC ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
                Mint USDC
              </button>
            </form>

            <div className="space-y-4">
              <h3 className="font-black uppercase">Quick Actions</h3>
              <p className="text-sm font-bold">Common testing scenarios</p>
              <button
                onClick={() => {
                  setMintUSDCAmount('10000')
                  mintUSDC('10000')
                }}
                disabled={isLoading}
                className="btn-neo bg-white w-full"
              >
                Mint 10,000 USDC
              </button>
              <button
                onClick={() => {
                  setMintUSDCAmount('100000')
                  mintUSDC('100000')
                }}
                disabled={isLoading}
                className="btn-neo bg-white w-full"
              >
                Mint 100,000 USDC
              </button>
              <button
                onClick={() => setGlobalYieldAmount('100')}
                disabled={isLoading}
                className="btn-neo bg-neo-green w-full"
              >
                Set Global Yield to $100
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPage
