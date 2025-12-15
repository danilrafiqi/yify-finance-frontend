import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Wallet, Lock } from 'lucide-react'
import { useCollateralSelectionViewModel } from '../viewmodels/collateral-selection.viewmodel'

const CollateralSelection: React.FC = () => {
  const navigate = useNavigate()
  const {
    walletNFTs,
    selectedNFT,
    setSelectedNFT,
    networks,
    currentNetwork,
    handleNetworkSwitch,
    depositedTokenIds
  } = useCollateralSelectionViewModel()

  const handleContinue = () => {
    if (selectedNFT) {
      navigate(`/borrower/calculator?tokenId=${selectedNFT.tokenId}&contract=${selectedNFT.contract}`)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black uppercase">Select Collateral</h1>
        <p className="text-xl font-bold text-gray-600">Choose an NFT from your wallet to use as collateral.</p>
      </div>

      {/* Network Filter */}
      <div className="flex justify-center gap-4 flex-wrap">
        {networks.map(network => (
          <button
            key={network.name}
            onClick={() => handleNetworkSwitch(network.id)}
            className={`
              px-6 py-3 border-4 border-black font-bold uppercase shadow-neo transition-all
              ${currentNetwork === network.name
                ? 'bg-black text-white translate-y-1 shadow-none'
                : 'bg-white hover:-translate-y-1 hover:shadow-neo-lg'}
            `}
          >
            {network.name}
          </button>
        ))}
      </div>

      {/* NFT Grid from Wallet */}
      <div>
        <h2 className="text-2xl font-black uppercase mb-4">Your NFTs ({walletNFTs.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {walletNFTs.map(nft => {
            const isDeposited = depositedTokenIds.includes(nft.tokenId)
            return (
              <div
                key={nft.uniqueKey}
                onClick={() => setSelectedNFT(nft)}
                className={`
                  card-neo bg-white cursor-pointer transition-all
                  ${selectedNFT?.uniqueKey === nft.uniqueKey
                    ? 'ring-4 ring-neo-green shadow-neo-lg scale-105'
                    : 'hover:shadow-neo-lg hover:scale-105'}
                `}
              >
                <div className="space-y-4">
                  <div className="w-full aspect-square bg-gray-200 border-2 border-black flex items-center justify-center relative">
                    <span className="font-black text-3xl text-gray-400">#{nft.tokenId}</span>
                    {isDeposited && (
                      <div className="absolute top-2 right-2 bg-neo-blue text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                        <Lock size={12} /> Deposited
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase">{nft.name}</h3>
                    <p className="text-sm font-bold text-gray-500">Token ID: {nft.tokenId}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {nft.contract.slice(0, 6)}...{nft.contract.slice(-4)}
                    </p>
                  </div>
                  {selectedNFT?.uniqueKey === nft.uniqueKey ? (
                    <div className="pt-2 border-t-2 border-gray-100">
                      <span className="bg-neo-green text-black font-bold px-2 py-1 text-xs uppercase rounded">
                        ✓ Selected
                      </span>
                      {isDeposited && (
                        <p className="text-xs text-gray-500 mt-2">
                          Already deposited. You can borrow more against this NFT.
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {walletNFTs.length === 0 && (
        <div className="text-center py-12 border-4 border-black border-dashed bg-gray-50">
          <Wallet size={64} className="mx-auto mb-4 text-gray-300" />
          <p className="font-bold text-gray-500 uppercase mb-4">No NFTs found in your wallet</p>
          <p className="text-sm text-gray-400 mb-4">Mint a test NFT to get started</p>
        </div>
      )}

      {/* Action Bar */}
      <div className="sticky bottom-8 z-30 flex justify-center">
        <button
          onClick={handleContinue}
          disabled={!selectedNFT}
          className={`
            btn-primary text-xl flex items-center gap-3 px-12 py-4
            ${!selectedNFT ? 'opacity-50 cursor-not-allowed filter grayscale' : ''}
          `}
        >
          Continue to Calculator <ArrowRight strokeWidth={3} />
        </button>
      </div>
    </div>
  )
}

export default CollateralSelection
