import React from 'react'
import { useWalletStore, getMockWallets, resetAllStores } from '../stores/walletStore'

const WalletConnection: React.FC = () => {
  const { isConnected, currentWallet, connectWallet, disconnectWallet } = useWalletStore()

  const mockWallets = getMockWallets()

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Connect Your Wallet
        </h2>
        <p className="text-gray-600 mb-6">
          Connect your wallet to start lending with your veNFT & NFT RWA
        </p>

        {!isConnected ? (
          <div className="space-y-3">
            {mockWallets.map((wallet) => (
              <button
                key={wallet.name}
                onClick={() => connectWallet(wallet)}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">{wallet.name}</span>
                <span className="ml-2 text-sm text-gray-500">(Mock)</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 text-sm font-medium">
                ✅ Wallet Connected!
              </p>
              <p className="text-green-700 text-xs mt-1 font-mono">
                {currentWallet?.address.slice(0, 6)}...{currentWallet?.address.slice(-4)}
              </p>
              <p className="text-green-700 text-xs mt-1">
                Balance: ${currentWallet?.balance.toLocaleString()} USDC
              </p>
            </div>

            <button
              onClick={disconnectWallet}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
        )}

        <div className="mt-6 text-left">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Mock Environment
          </h3>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-yellow-800 text-sm">
              🧪 This is a <strong>mock environment</strong> for development.
              All wallet connections and transactions are simulated.
            </p>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li>• Base Mainnet (Mock)</li>
            <li>• Dummy NFT data & balances</li>
            <li>• Simulated transactions</li>
          </ul>
          
          <button
            onClick={resetAllStores}
            className="mt-4 w-full px-3 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 transition-colors"
          >
            🔄 Reset All Stores (Dev)
          </button>
        </div>
      </div>
    </div>
  )
}

export default WalletConnection
