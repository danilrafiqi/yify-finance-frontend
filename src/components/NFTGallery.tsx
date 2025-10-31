import React, { useState, useEffect } from 'react'
import { useWalletStore } from '../stores/walletStore'
import { useNFTStore } from '../stores/nftStore'

const NFTGallery: React.FC = () => {
  const { isConnected } = useWalletStore()
  const { nfts, getAvailableNFTs, getDepositedNFTs } = useNFTStore()
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'available' | 'deposited'>('all')

  useEffect(() => {
    if (isConnected) {
      fetchNFTs()
    }
  }, [isConnected])

  const fetchNFTs = async () => {
    setLoading(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      // NFTs are loaded from Zustand store
    } catch (error) {
      console.error('Error fetching NFTs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredNFTs = nfts.filter(nft => {
    if (filter === 'available') return !nft.isDeposited
    if (filter === 'deposited') return nft.isDeposited
    return true
  })

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please connect your wallet to view your NFTs</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Your veNFT & NFT RWA Collections</h2>

        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({nfts.length})
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'available'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Available ({nfts.filter(n => !n.isDeposited).length})
          </button>
          <button
            onClick={() => setFilter('deposited')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'deposited'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Deposited ({nfts.filter(n => n.isDeposited).length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading your NFTs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNFTs.map((nft) => (
            <div
              key={nft.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{nft.name.split(' ')[0]}</div>
                  <div className="text-sm opacity-90">{nft.name.split(' ').slice(1).join(' ')}</div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{nft.name}</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Locked Amount:</span>
                    <span className="font-medium">{nft.lockAmount.toLocaleString()} AERO</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Floor Price:</span>
                    <span className="font-medium">${nft.floorPrice.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Yield:</span>
                    <span className="font-medium text-green-600">{nft.currentYield}%</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">LTV:</span>
                    <span className="font-medium">{nft.ltv}%</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Expiry:</span>
                    <span className="font-medium">{nft.expiryDate}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      nft.isDeposited
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {nft.isDeposited ? 'Deposited' : 'Available'}
                  </span>

                          {nft.isDeposited ? (
                            <span className="text-xs text-gray-500 font-medium">
                              Deposited as Collateral
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                // Navigate to deposit page with this NFT pre-selected
                                alert(`Deposit NFT: ${nft.name}\n\nThis will create an isolated position for this NFT, making it available as collateral for borrowing.`)
                              }}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                              Deposit as Collateral
                            </button>
                          )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredNFTs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {filter === 'all'
              ? "You don't have any veNFT or NFT RWA yet"
              : `No ${filter} NFTs found`}
          </p>
        </div>
      )}
    </div>
  )
}

export default NFTGallery
