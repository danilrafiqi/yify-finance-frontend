import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount, useChainId, useSwitchChain, useWriteContract, useReadContracts, useReadContract, usePublicClient } from 'wagmi'
import { ArrowRight, Plus, Wallet, Lock, DollarSign } from 'lucide-react'
import { parseUnits, parseEther } from 'viem'
import { CONTRACT_ADDRESSES, LISK_SEPOLIA_CHAIN_ID, VENFT_ABI, RWANFT_ABI, SIMPLE_ORACLE_ABI, ERC721_ABI } from '../../constants/contracts'
import { toast } from 'react-hot-toast'

// Simple NFT interface for wallet NFTs
interface WalletNFT {
  tokenId: string
  contract: string
  name: string
  uniqueKey: string // Unique key combining contract + tokenId
}

const CollateralSelection: React.FC = () => {
  const navigate = useNavigate()
  const { address } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const publicClient = usePublicClient()
  const [mockPrice, setMockPrice] = useState<string>('5000') // Default 5000
  const [nftType, setNftType] = useState<'veNFT' | 'rwaNFT'>('veNFT') // Default to veNFT

  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES[LISK_SEPOLIA_CHAIN_ID]

  // Mint Mock NFT
  const { writeContractAsync: writeMint, isPending: isMinting } = useWriteContract()

  // Fetch Total Supply for veNFT
  const { data: veNFTTotalSupply } = useReadContract({
    address: addresses.veNFT as `0x${string}`,
    abi: VENFT_ABI,
    functionName: 'totalSupply',
    query: { refetchInterval: 5000 } // More frequent updates
  })

  // Dynamic Scanning based on Total Supply for veNFT
  const veNFTTokenIdsToCheck = useMemo(() => {
    if (!veNFTTotalSupply) return []
    const limit = Number(veNFTTotalSupply)
    // Add extra buffer for newly minted tokens
    const safeLimit = Math.max(limit, 50) // Scan at least 50 tokens for safety
    return Array.from({ length: safeLimit }, (_, i) => i)
  }, [veNFTTotalSupply])

  // For RWA NFT, scan more tokens since they can be minted dynamically
  const rwaNFTTokenIdsToCheck = useMemo(() => {
    // Scan first 50 tokens for safety
    return Array.from({ length: 50 }, (_, i) => i)
  }, [])

  // Check ownership for veNFT tokens
  const veNFTOwnershipChecks = useReadContracts({
    contracts: veNFTTokenIdsToCheck.map(tokenId => ({
      address: addresses.veNFT as `0x${string}`,
      abi: VENFT_ABI,
      functionName: 'ownerOf',
      args: [BigInt(tokenId)]
    })),
    query: { enabled: !!address && veNFTTokenIdsToCheck.length > 0, refetchInterval: 2000 }
  })

  // Check ownership for rwaNFT tokens
  const rwaNFTOwnershipChecks = useReadContracts({
    contracts: rwaNFTTokenIdsToCheck.map(tokenId => ({
      address: addresses.rwaNFT as `0x${string}`,
      abi: RWANFT_ABI,
      functionName: 'ownerOf',
      args: [BigInt(tokenId)]
    })),
    query: { enabled: !!address && rwaNFTTokenIdsToCheck.length > 0, refetchInterval: 2000 }
  })

  // ... (Lens fetching remains the same) ...

  const { data: userLoans } = useReadContract({
    // ... (keep existing Lens useReadContract) ...
    address: addresses.lens as `0x${string}`, // Use Lens in V2
    abi: [
      {
        "type": "function",
        "name": "getUserLoans",
        "inputs": [
          { "name": "loanManager", "type": "address" },
          { "name": "user", "type": "address" }
        ],
        "outputs": [
          {
            "components": [
              { "name": "loanId", "type": "bytes32" },
              { "name": "borrower", "type": "address" },
              { "name": "nftContract", "type": "address" },
              { "name": "tokenId", "type": "uint256" },
              { "name": "totalBorrowed", "type": "uint256" },
              { "name": "remainingDebt", "type": "uint256" },
              { "name": "isActive", "type": "bool" }
            ],
            "name": "",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "view"
      }
    ] as const,
    functionName: 'getUserLoans',
    args: [addresses.loanManager, address!],
    query: { enabled: !!address && !!addresses.loanManager }
  })

  // Use useMemo to extract token IDs from ACTIVE Loans only
  const depositedTokenIds = useMemo(() => {
    return userLoans ? userLoans.filter(loan => loan.isActive).map(loan => loan.tokenId.toString()) : []
  }, [userLoans])

  // Combine wallet NFTs with deposited NFTs
  const [walletNFTs, setWalletNFTs] = useState<WalletNFT[]>([])

  useEffect(() => {
    if ((veNFTOwnershipChecks.data || rwaNFTOwnershipChecks.data) && address) {
      const ownedNFTs: WalletNFT[] = []

      // Add veNFTs from wallet (ownerOf check)
      if (veNFTOwnershipChecks.data) {
        veNFTOwnershipChecks.data.forEach((result, index) => {
          // Only process successful results with valid owners
          if (result.status === 'success' && result.result) {
            const owner = result.result as string
            if (owner.toLowerCase() === address.toLowerCase()) {
              // Only add if NOT deposited (UX Request)
              const tokenIdStr = index.toString()
              if (!depositedTokenIds.includes(tokenIdStr)) {
                ownedNFTs.push({
                  tokenId: tokenIdStr,
                  contract: addresses.veNFT,
                  name: `veNFT #${index}`,
                  uniqueKey: `${addresses.veNFT}-${tokenIdStr}`
                })
              }
            }
          }
          // Ignore failed results (non-existent tokens) - this is expected for buffer scanning
        })
      }

      // Add rwaNFTs from wallet (ownerOf check)
      if (rwaNFTOwnershipChecks.data) {
        rwaNFTOwnershipChecks.data.forEach((result, index) => {
          // Only process successful results with valid owners
          if (result.status === 'success' && result.result) {
            const owner = result.result as string
            if (owner.toLowerCase() === address.toLowerCase()) {
              // Only add if NOT deposited (UX Request)
              const tokenIdStr = index.toString()
              if (!depositedTokenIds.includes(tokenIdStr)) {
                ownedNFTs.push({
                  tokenId: tokenIdStr,
                  contract: addresses.rwaNFT,
                  name: `RWA NFT #${index}`,
                  uniqueKey: `${addresses.rwaNFT}-${tokenIdStr}`
                })
              }
            }
          }
          // Ignore failed results (non-existent tokens) - this is expected for buffer scanning
        })
      }

      // UX Update: Do NOT add deposited NFTs to the list
      // Previously we merged them, now we just show wallet items available for collateral.

      setWalletNFTs(ownedNFTs)
    }
  }, [veNFTOwnershipChecks.data, rwaNFTOwnershipChecks.data, address, addresses.veNFT, addresses.rwaNFT, depositedTokenIds])

  const [selectedNFT, setSelectedNFT] = useState<WalletNFT | null>(null)

  const handleMintMockNFT = async () => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!mockPrice || isNaN(Number(mockPrice))) {
      toast.error('Please enter a valid price')
      return
    }

    try {
      const isVeNFT = nftType === 'veNFT'
      const contractAddress = isVeNFT ? addresses.veNFT : addresses.rwaNFT
      const contractABI = isVeNFT ? VENFT_ABI : RWANFT_ABI

      // 1. Mint
      toast.loading('Step 1/2: Minting NFT...', { id: 'mint-toast' })

      let mintArgs: any[]
      if (isVeNFT) {
        mintArgs = [address, parseUnits('1000', 18), BigInt(63072000)] // power and duration for veNFT
      } else {
        mintArgs = [address] // only recipient for RWA NFT
      }

      const mintHash = await writeMint({
        address: contractAddress as `0x${string}`,
        abi: contractABI,
        functionName: 'mint',
        args: mintArgs as any
      })

      toast.loading('Waiting for confirmation...', { id: 'mint-toast' })
      const receipt = await publicClient?.waitForTransactionReceipt({ hash: mintHash })

      if (!receipt) throw new Error("Failed to get receipt")

      // 2. Get the newly minted token ID by checking updated total supply
      // This is more reliable than estimating from old totalSupply
      let mintedId = 0n

      try {
        if (isVeNFT) {
          // For veNFT, query totalSupply after mint to get the new token ID
          const newTotalSupply = await publicClient?.readContract({
            address: addresses.veNFT as `0x${string}`,
            abi: VENFT_ABI,
            functionName: 'totalSupply'
          })
          mintedId = newTotalSupply ? BigInt(Number(newTotalSupply) - 1) : 0n
        } else {
          // For RWA NFT, we need to find the highest token ID owned by user
          // Since RWA NFT doesn't have totalSupply, we'll scan for the highest owned token
          let highestId = 0n
          for (let i = 0; i < 100; i++) { // Scan up to 100 tokens
            try {
              const owner = await publicClient?.readContract({
                address: addresses.rwaNFT as `0x${string}`,
                abi: ERC721_ABI,
                functionName: 'ownerOf',
                args: [BigInt(i)]
              })
              if (owner && owner.toLowerCase() === address.toLowerCase()) {
                highestId = BigInt(i)
              }
            } catch {
              // Token doesn't exist, continue
              break
            }
          }
          mintedId = highestId
        }
      } catch (error) {
        console.error("Failed to determine minted token ID:", error)
        // Fallback to estimation
        mintedId = isVeNFT ?
          (veNFTTotalSupply ? BigInt(Number(veNFTTotalSupply)) : 0n) :
          0n
      }

      console.log("Minted ID:", mintedId.toString())

      // 3. Set Price (only for supported contracts)
      toast.loading(`Step 2/2: Setting Price to $${mockPrice}...`, { id: 'mint-toast' })

      const priceInWei = parseEther(mockPrice) // Oracle uses 1e18 for price

      await writeMint({
        address: addresses.nftOracle as `0x${string}`,
        abi: SIMPLE_ORACLE_ABI,
        functionName: 'setTokenPrice',
        args: [contractAddress, mintedId, priceInWei]
      })

      toast.success(`Success! ${nftType} #${mintedId} minted with value $${mockPrice}`, { id: 'mint-toast' })

    } catch (error: any) {
      console.error(error)
      toast.error(error.shortMessage || 'Minting failed', { id: 'mint-toast' })
    }
  }

  const handleContinue = () => {
    if (selectedNFT) {
      navigate(`/borrower/calculator?tokenId=${selectedNFT.tokenId}&contract=${selectedNFT.contract}`)
    }
  }

  // Network buttons
  const networks = [
    { name: 'Base', id: 84532 },
    { name: 'Optimism', id: 11155420 },
    { name: 'Lisk', id: 4202 },
    { name: 'Ethereum', id: 11155111 },
    { name: 'Foundry', id: 31337 }
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
      case 31337: return 'Foundry'
      default: return 'Unknown'
    }
  }

  const currentNetwork = getNetworkCategory(chainId)

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
