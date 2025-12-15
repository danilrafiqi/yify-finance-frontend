// shared/hooks/use-platform-stats.ts
import { useReadContracts, useChainId } from 'wagmi'
import { CONTRACT_ADDRESSES, LISK_SEPOLIA_CHAIN_ID } from '../../constants/contracts'

export function usePlatformStats() {
    const chainId = useChainId()
    const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES[LISK_SEPOLIA_CHAIN_ID]

    const lendingPoolAbi = [
        {
            type: 'function',
            name: 'totalAssets',
            inputs: [],
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'view'
        },
        {
            type: 'function',
            name: 'totalBorrowed',
            inputs: [],
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'view'
        }
    ] as const

    const { data, isLoading, error, refetch } = useReadContracts({
        contracts: [
            {
                address: addresses.lendingPool as `0x${string}`,
                abi: lendingPoolAbi,
                functionName: 'totalAssets'
            },
            {
                address: addresses.lendingPool as `0x${string}`,
                abi: lendingPoolAbi,
                functionName: 'totalBorrowed'
            }
        ]
    })

    const totalAssets = data?.[0]?.status === 'success' ? data[0].result : 0n
    const totalBorrowed = data?.[1]?.status === 'success' ? data[1].result : 0n
    const availableFund = totalAssets - totalBorrowed

    return {
        tvl: totalAssets,
        totalBorrow: totalBorrowed,
        availableFund,
        isLoading,
        error,
        refetch
    }
}

