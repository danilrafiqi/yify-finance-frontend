import React from 'react'
import { useWalletStore, getMockWallets } from '../../stores/walletStore'
import { Wallet } from 'lucide-react'

const WalletConnection: React.FC = () => {
  const { isConnected, currentWallet, connectWallet, disconnectWallet } = useWalletStore()
  const mockWallets = getMockWallets()

  if (isConnected && currentWallet) {
    return (
      <div className="flex items-center gap-4">
        <div className="hidden md:block text-right">
          <p className="text-sm font-bold">{currentWallet.name}</p>
          <p className="text-xs text-gray-600 font-mono">
            {currentWallet.address.slice(0, 6)}...{currentWallet.address.slice(-4)}
          </p>
        </div>
        <div className="bg-neo-green px-3 py-1 border-2 border-black font-bold">
          ${currentWallet.balance.toLocaleString()} USDC
        </div>
        <button
          onClick={disconnectWallet}
          className="px-4 py-2 bg-neo-red border-2 border-black font-bold text-white hover:bg-red-600 transition-colors uppercase text-sm"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => connectWallet(mockWallets[0])} // Just connect the first one for simplicity in header
      className="flex items-center gap-2 px-6 py-2 bg-neo-black text-neo-white border-2 border-transparent font-bold uppercase hover:bg-gray-800 transition-colors shadow-neo-sm hover:shadow-neo hover:-translate-y-0.5"
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </button>
  )
}

export default WalletConnection

