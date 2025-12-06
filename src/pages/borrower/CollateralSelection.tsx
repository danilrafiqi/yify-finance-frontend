import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount, useChainId, useSwitchChain, useWriteContract, useReadContracts, useReadContract } from 'wagmi'
import { ArrowRight, Plus, Wallet, Lock } from 'lucide-react'
import { parseUnits } from 'viem'
import { CONTRACT_ADDRESSES, LISK_SEPOLIA_CHAIN_ID, ERC721_ABI } from '../../constants/contracts'
import { toast } from 'react-hot-toast'

// Simple NFT interface for wallet NFTs
interface WalletNFT {
  tokenId: string
  contract: string
  name: string
}

const CollateralSelection: React.FC = () => {
  const navigate = useNavigate()
  const { address } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES[LISK_SEPOLIA_CHAIN_ID]

  // Mint Mock NFT
  const { writeContract: writeMint, isPending: isMinting } = useWriteContract()

  // Strategy: Check ownership of token IDs 1-20 (reasonable range for testing)
  const tokenIdsToCheck = useMemo(() => Array.from({ length: 20 }, (_, i) => i + 1), [])

  const ownershipChecks = useReadContracts({
    contracts: tokenIdsToCheck.map(tokenId => ({
      address: addresses.veNFT as `0x${string}`,
      abi: [
        {
          "type": "function",
          "name": "ownerOf",
          "inputs": [{ "name": "tokenId", "type": "uint256" }],
          "outputs": [{ "name": "", "type": "address" }],
          "stateMutability": "view"
        }
      ] as const,
      functionName: 'ownerOf',
      args: [BigInt(tokenId)]
    })),
    query: { enabled: !!address }
  })

  // Fetch deposited NFTs from CollateralManager
  const { data: depositedCollaterals } = useReadContract({
    address: addresses.collateralManager as `0x${string}`,
    abi: [
      {
        "type": "function",
        "name": "getUserCollaterals",
        "inputs": [{ "name": "user", "type": "address" }],
        "outputs": [
          { "name": "nftContracts", "type": "address[]" },
          { "name": "tokenIds", "type": "uint256[]" }
        ],
        "stateMutability": "view"
      }
    ] as const,
    functionName: 'getUserCollaterals',
    args: [address!],
    query: { enabled: !!address }
  })

  // Use useMemo to prevent infinite loop
  const depositedTokenIds = useMemo(() => {
    return depositedCollaterals ? depositedCollaterals[1].map((id: bigint) => id.toString()) : []
  }, [depositedCollaterals])

  // Combine wallet NFTs with deposited NFTs
  const [walletNFTs, setWalletNFTs] = useState<WalletNFT[]>([])

  useEffect(() => {
    if (ownershipChecks.data && address) {
      const ownedNFTs: WalletNFT[] = []

      // Add NFTs from wallet (ownerOf check)
      ownershipChecks.data.forEach((result, index) => {
        if (result.status === 'success' && result.result) {
          const owner = result.result as string
          if (owner.toLowerCase() === address.toLowerCase()) {
            ownedNFTs.push({
              tokenId: (index + 1).toString(),
              contract: addresses.veNFT,
              name: `veNFT #${index + 1}`
            })
          }
        }
      })

      // Add deposited NFTs (they're owned by CollateralManager but belong to user)
      depositedTokenIds.forEach(tokenId => {
        // Only add if not already in the list
        if (!ownedNFTs.find(nft => nft.tokenId === tokenId)) {
          ownedNFTs.push({
            tokenId,
            contract: addresses.veNFT,
            name: `veNFT #${tokenId}`
          })
        }
      })

      setWalletNFTs(ownedNFTs)
    }
  }, [ownershipChecks.data, address, addresses.veNFT, depositedTokenIds])

  const [selectedNFT, setSelectedNFT] = useState<WalletNFT | null>(null)

  const handleMintMockNFT = () => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }
    writeMint({
      address: addresses.veNFT as `0x${string}`,
      abi: ERC721_ABI,
      functionName: 'mint',
      args: [address, parseUnits('1000', 18), BigInt(63072000)] // 1000 voting power, 2 years lock
    })
    toast.success('Minting Mock NFT... Check your wallet in a moment!')
  }

  const handleContinue = () => {
    if (selectedNFT) {
      navigate(`/borrower/calculator?tokenId=${selectedNFT.tokenId}`)
    }
  }

  // Network buttons
  const networks = [
    { name: 'Base', id: 84532 },
    { name: 'Optimism', id: 11155420 },
    { name: 'Lisk', id: 4202 },
    { name: 'Ethereum', id: 11155111 }
  ]

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

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black uppercase">Select Collateral</h1>
        <p className="text-xl font-bold text-gray-600">Choose an NFT from your wallet to use as collateral.</p>

        {/* Mint Mock NFT Button */}
        <button
          onClick={handleMintMockNFT}
          disabled={isMinting}
          className="btn-neo bg-neo-yellow inline-flex items-center gap-2 mx-auto"
        >
          <Plus size={18} />
          {isMinting ? 'Minting Mock NFT...' : 'Mint Mock NFT (For Testing)'}
        </button>
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

      {/* NFT Grid from Wallet */}
      <div>
        <h2 className="text-2xl font-black uppercase mb-4">Your NFTs ({walletNFTs.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {walletNFTs.map(nft => {
            const isDeposited = depositedTokenIds.includes(nft.tokenId)
            return (
              <div
                key={nft.tokenId}
                onClick={() => setSelectedNFT(nft)}
                className={`
                  card-neo bg-white cursor-pointer transition-all
                  ${selectedNFT?.tokenId === nft.tokenId
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
                  {selectedNFT?.tokenId === nft.tokenId ? (
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
