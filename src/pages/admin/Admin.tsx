import React, { useState } from 'react'
import { useAccount, useWriteContract, useReadContract, useChainId } from 'wagmi'
import { parseUnits, formatUnits, erc20Abi } from 'viem'
import { toast } from 'react-hot-toast'
import { Settings, Zap, Coins, Database, Info, Loader2 } from 'lucide-react'
import { CONTRACT_ADDRESSES, LISK_SEPOLIA_CHAIN_ID } from '../../constants/contracts'
import { UNIVERSAL_YIELD_GENERATOR_ABI, MOCK_USDC_ABI, MOCK_NFT_ABI, ADMIN_CONTRACT_ADDRESSES } from '../../constants/adminContracts'
import { usePlatformStats } from '../../hooks/usePlatformStats'

const AdminPage: React.FC = () => {
    const { address } = useAccount()
    const chainId = useChainId()
    const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES[LISK_SEPOLIA_CHAIN_ID]
    const adminAddresses = ADMIN_CONTRACT_ADDRESSES[chainId as keyof typeof ADMIN_CONTRACT_ADDRESSES]

    const { writeContractAsync } = useWriteContract()
    const { tvl, totalBorrow, availableFund } = usePlatformStats()

    // States
    const [globalYieldAmount, setGlobalYieldAmount] = useState('')
    const [specificYieldAmount, setSpecificYieldAmount] = useState('')
    const [specificNFTAddress, setSpecificNFTAddress] = useState<string>(addresses.veNFT)
    const [specificTokenId, setSpecificTokenId] = useState('')
    const [mintUSDCAmount, setMintUSDCAmount] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Read USDC balance
    const { data: usdcBalance } = useReadContract({
        address: addresses.usdc as `0x${string}`,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address!],
        query: { enabled: !!address }
    })

    // ===== YIELD OPERATIONS =====
    const handleGlobalYield = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!globalYieldAmount || !adminAddresses?.yieldGenerator) {
            toast.error('Invalid input or yield generator not available')
            return
        }

        try {
            setIsLoading(true)
            const amount = parseUnits(globalYieldAmount, 6) // USDC 6 decimals

            const hash = await writeContractAsync({
                address: adminAddresses.yieldGenerator as `0x${string}`,
                abi: UNIVERSAL_YIELD_GENERATOR_ABI,
                functionName: 'generateGlobalYield',
                args: [amount]
            })

            toast.success(`Global yield simulated! Tx: ${hash.slice(0, 10)}...`)
            setGlobalYieldAmount('')
        } catch (error: any) {
            console.error('Global Yield Error:', error)

            // Check if it's an ownership error
            if (error.message?.includes('Ownable') || error.message?.includes('caller is not the owner')) {
                toast.error('Only contract owner can simulate global yield. Use specific yield instead or connect with owner account (0xf39Fd...)')
            } else {
                toast.error(error.shortMessage || error.message || 'Failed to simulate yield')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleSpecificYield = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!specificYieldAmount || !specificTokenId || !adminAddresses?.yieldGenerator) {
            toast.error('Please fill all fields')
            return
        }

        try {
            setIsLoading(true)
            const amount = parseUnits(specificYieldAmount, 6)

            const hash = await writeContractAsync({
                address: adminAddresses.yieldGenerator as `0x${string}`,
                abi: UNIVERSAL_YIELD_GENERATOR_ABI,
                functionName: 'simulateYield',
                args: [specificNFTAddress as `0x${string}`, BigInt(specificTokenId), amount]
            })

            toast.success(`Yield simulated for NFT #${specificTokenId}! Tx: ${hash.slice(0, 10)}...`)
            setSpecificYieldAmount('')
            setSpecificTokenId('')
        } catch (error: any) {
            console.error(error)
            toast.error(error.shortMessage || 'Failed to simulate yield')
        } finally {
            setIsLoading(false)
        }
    }

    // ===== NFT OPERATIONS =====
    const handleMintNFT = async (nftType: 'veNFT' | 'rwaNFT') => {
        if (!address) {
            toast.error('Please connect wallet')
            return
        }

        try {
            setIsLoading(true)
            const nftAddress = nftType === 'veNFT' ? addresses.veNFT : addresses.rwaNFT

            const hash = await writeContractAsync({
                address: nftAddress as `0x${string}`,
                abi: MOCK_NFT_ABI,
                functionName: 'mint',
                args: [address]
            })

            toast.success(`${nftType} minted! Tx: ${hash.slice(0, 10)}...`)
        } catch (error: any) {
            console.error(error)
            toast.error(error.shortMessage || `Failed to mint ${nftType}`)
        } finally {
            setIsLoading(false)
        }
    }

    // ===== LIQUIDITY OPERATIONS =====
    const handleMintUSDC = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!mintUSDCAmount || !address) {
            toast.error('Invalid amount or wallet not connected')
            return
        }

        try {
            setIsLoading(true)
            const amount = parseUnits(mintUSDCAmount, 6)

            const hash = await writeContractAsync({
                address: addresses.usdc as `0x${string}`,
                abi: MOCK_USDC_ABI,
                functionName: 'mintPublic',
                args: [address, amount]
            })

            toast.success(`USDC minted! Tx: ${hash.slice(0, 10)}...`)
            setMintUSDCAmount('')
        } catch (error: any) {
            console.error(error)
            toast.error(error.shortMessage || 'Failed to mint USDC')
        } finally {
            setIsLoading(false)
        }
    }

    const isLocalChain = chainId === 31337

    if (!isLocalChain) {
        return (
            <div className="text-center py-20">
                <Settings size={64} className="mx-auto mb-4 text-gray-300" />
                <h2 className="text-3xl font-black uppercase mb-4">Admin Panel</h2>
                <p className="font-bold text-gray-600">Admin operations are only available on local network (Foundry)</p>
                <p className="text-sm text-gray-500 mt-2">Current network: {chainId === 4202 ? 'Lisk Sepolia' : 'Unknown'}</p>
            </div>
        )
    }

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
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                            Simulate Global Yield
                        </button>
                    </form>

                    <form onSubmit={handleSpecificYield} className="space-y-4">
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
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                            Simulate Specific Yield
                        </button>
                    </form>
                </div>

                {/* NFT Operations */}
                <div className="card-neo bg-neo-blue text-white">
                    <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
                        <Coins size={24} />
                        NFT Operations
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <h3 className="font-black uppercase mb-2">Mint veNFT</h3>
                            <p className="text-sm font-bold mb-4 text-blue-100">Mint a voting escrow NFT to your wallet</p>
                            <button
                                onClick={() => handleMintNFT('veNFT')}
                                disabled={isLoading}
                                className="btn-neo bg-white text-black w-full flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Coins size={20} />}
                                Mint veNFT
                            </button>
                        </div>

                        <div className="pt-6 border-t-2 border-white">
                            <h3 className="font-black uppercase mb-2">Mint RWA NFT</h3>
                            <p className="text-sm font-bold mb-4 text-blue-100">Mint a Real World Asset NFT to your wallet</p>
                            <button
                                onClick={() => handleMintNFT('rwaNFT')}
                                disabled={isLoading}
                                className="btn-neo bg-white text-black w-full flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Coins size={20} />}
                                Mint RWA NFT
                            </button>
                        </div>
                    </div>
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
                                    {usdcBalance ? parseFloat(formatUnits(usdcBalance, 6)).toLocaleString() : '0'} USDC
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
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
                                Mint USDC
                            </button>
                        </form>

                        <div className="space-y-4">
                            <h3 className="font-black uppercase">Quick Actions</h3>
                            <p className="text-sm font-bold">Common testing scenarios</p>
                            <button
                                onClick={() => {
                                    setMintUSDCAmount('10000')
                                    setTimeout(() => {
                                        const form = document.querySelector('form') as HTMLFormElement
                                        form?.requestSubmit()
                                    }, 100)
                                }}
                                disabled={isLoading}
                                className="btn-neo bg-white w-full"
                            >
                                Mint 10,000 USDC
                            </button>
                            <button
                                onClick={() => {
                                    setMintUSDCAmount('100000')
                                    setTimeout(() => {
                                        const form = document.querySelector('form') as HTMLFormElement
                                        form?.requestSubmit()
                                    }, 100)
                                }}
                                disabled={isLoading}
                                className="btn-neo bg-white w-full"
                            >
                                Mint 100,000 USDC
                            </button>
                            <button
                                onClick={() => {
                                    setGlobalYieldAmount('100')
                                }}
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
