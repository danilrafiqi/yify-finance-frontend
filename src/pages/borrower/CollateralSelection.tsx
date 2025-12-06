import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNFTStore } from '../../stores/nftStore'
import { useChainId, useSwitchChain } from 'wagmi'
import NFTCard from '../../components/common/NFTCard'
import { MockNFT } from '../../utils/mockData'
import { ArrowRight } from 'lucide-react'

const CollateralSelection: React.FC = () => {
  const navigate = useNavigate()
  const { nfts } = useNFTStore()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  // Grouping chains into UI Categories
  const getNetworkCategory = (id: number) => {
    switch (id) {
      case 8453:
      case 84532: return 'Base'

      case 10:
      case 11155420: return 'Optimism'

      case 4202: return 'Lisk'

      case 1:
      case 11155111: return 'Ethereum'

      default: return 'Unknown'
    }
  }
  const currentNetwork = getNetworkCategory(chainId)

  const [selectedNFT, setSelectedNFT] = useState<MockNFT | null>(null)

  // Filter NFTs based on the simplified category
  // This allows 'Base' mock data to show for 'Base Sepolia' connection
  const filteredNFTs = nfts.filter(nft => nft.network === currentNetwork)

  const handleSelect = (nft: MockNFT) => {
    setSelectedNFT(nft)
  }

  const handleContinue = () => {
    if (selectedNFT) {
      // Navigate to calculator with selected NFT ID
      navigate(`/borrower/calculator?nftId=${selectedNFT.id}`)
    }
  }

  // Buttons for the 4 supported ecosystem categories
  // Defaulting to Testnets for the 'switchChain' action since this is a dev/mock environment
  const networks = [
    { name: 'Base', id: 84532 }, // Switch to Base Sepolia
    { name: 'Optimism', id: 11155420 }, // Switch to Op Sepolia
    { name: 'Lisk', id: 4202 }, // Switch to Lisk Sepolia
    { name: 'Ethereum', id: 11155111 } // Switch to Sepolia
  ]

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black uppercase">Select Collateral</h1>
        <p className="text-xl font-bold text-gray-600">Choose a productive NFT to borrow against.</p>
      </div>

      {/* Network Filter */}
      <div className="flex justify-center gap-4 flex-wrap">
        {networks.map(network => (
          <button
            key={network.name}
            onClick={() => {
              switchChain({ chainId: network.id })
              setSelectedNFT(null)
            }}
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

      {/* NFT Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {filteredNFTs.map(nft => (
          <NFTCard
            key={nft.id}
            nft={nft}
            selected={selectedNFT?.id === nft.id}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {filteredNFTs.length === 0 && (
        <div className="text-center py-12 border-4 border-black border-dashed bg-gray-50">
          <p className="font-bold text-gray-500 uppercase">No NFTs found on {currentNetwork}</p>
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
