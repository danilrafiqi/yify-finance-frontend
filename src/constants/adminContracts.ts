// Admin-specific contract ABIs for testing and development operations

export const UNIVERSAL_YIELD_GENERATOR_ABI = [
    {
        type: 'function',
        name: 'generateGlobalYield',
        inputs: [{ name: 'amountPerToken', type: 'uint256' }],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'simulateYield',
        inputs: [
            { name: 'asset', type: 'address' },
            { name: 'tokenId', type: 'uint256' },
            { name: 'amount', type: 'uint256' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'fundTreasury',
        inputs: [{ name: 'amount', type: 'uint256' }],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'registeredTokens',
        inputs: [{ name: 'index', type: 'uint256' }],
        outputs: [
            { name: 'asset', type: 'address' },
            { name: 'tokenId', type: 'uint256' }
        ],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'claimable',
        inputs: [
            { name: 'asset', type: 'address' },
            { name: 'tokenId', type: 'uint256' }
        ],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    }
] as const

export const MOCK_USDC_ABI = [
    {
        type: 'function',
        name: 'mintPublic',
        inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'mintAdmin',
        inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'balanceOf',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'totalSupply',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    }
] as const

export const MOCK_NFT_ABI = [
    {
        type: 'function',
        name: 'mint',
        inputs: [{ name: 'to', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'balanceOf',
        inputs: [{ name: 'owner', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'tokenOfOwnerByIndex',
        inputs: [
            { name: 'owner', type: 'address' },
            { name: 'index', type: 'uint256' }
        ],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'totalSupply',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view'
    }
] as const

export const ADMIN_CONTRACT_ADDRESSES = {
    31337: { // Foundry local
        yieldGenerator: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9', // Updated from latest deployment
    },
    4202: { // Lisk Sepolia
        yieldGenerator: '0x0000000000000000000000000000000000000000', // Not deployed on testnet
    }
} as const
