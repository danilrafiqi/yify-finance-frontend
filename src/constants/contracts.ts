import { foundry, liskSepolia, sepolia, baseSepolia, optimismSepolia } from 'wagmi/chains';
import { erc20Abi, erc721Abi } from 'viem';
import YIFYLoanManagerV2 from './abis/YIFYLoanManagerV2';
import YIFYLendingPoolV2 from './abis/YIFYLendingPoolV2';
import YIFYYieldDistributorV2 from './abis/YIFYYieldDistributorV2';
import YIFYLens from './abis/YIFYLens';
import MockVeNFT from './abis/MockVeNFT';
import MockRWANFT from './abis/MockRWANFT';
import MockUSDC from './abis/MockUSDC';
import SimpleNFTOracle from './abis/SimpleNFTOracle';

export const LISK_SEPOLIA_CHAIN_ID = liskSepolia.id;
export const FOUNDRY_CHAIN_ID = foundry.id;
export const SEPOLIA_CHAIN_ID = sepolia.id;
export const BASE_SEPOLIA_CHAIN_ID = baseSepolia.id;
export const OP_SEPOLIA_CHAIN_ID = optimismSepolia.id;

export const CONTRACT_ADDRESSES = {
    [LISK_SEPOLIA_CHAIN_ID]: {
        lendingPool: '0xD9f4b969A4b4d371FE5a47Ed433F09C2dAdB12D6',
        collateralManager: '0x1e89e8BC52d81526Ea5E5Cd189469d1A7092b96F',
        usdc: '0xC996F3BAB813A943BB16E98187709d53a277679b',
        veNFT: '0x8f83b361b96f88c61d302DAE0445B2AceE359072',
        rwaNFT: '0xa1E8A9bD3c756B355d9BAA451be37F0dEA989Cc5',
        nftOracle: '0xb4f1A84f121a31C841127c278212343585EE8dFC',
        loanManager: '0x1e89e8BC52d81526Ea5E5Cd189469d1A7092b96F',
        yieldDistributor: '0x2016a98D67bADD6D4B5136e05c45c4b4BC41b915',
        lens: '0x2B7144146F17Bcb6Fe314d98d653731850CD3665',
    },
    [SEPOLIA_CHAIN_ID]: {
        lendingPool: '0x170Ebee767c91A21Fb7E677f6B853bceaB28c584',
        collateralManager: '0x8B1007CbAE127A5210454b02Ecd2A3888d24Ec4E',
        usdc: '0xFF196F1e3a895404d073b8611252cF97388773A7',
        veNFT: '0xB98E0Fb673e5a0C6e15F1D0a9f36E7dA954A0D5E',
        rwaNFT: '0xC36E784E1dff616bDae4EAc7B310F0934FaF04a4',
        nftOracle: '0xD2BD10D3f2e3a057F0040663B1EEbf4d1874fEAB',
        loanManager: '0x8B1007CbAE127A5210454b02Ecd2A3888d24Ec4E',
        yieldDistributor: '0xA20657F3CFC43713a13ACC52a3d0D7BB325671ec',
        lens: '0xD035D8D5075B6564569D4682618Ac69e550d3048',
    },
    [BASE_SEPOLIA_CHAIN_ID]: {
        lendingPool: '0xB2386e4b46aECEa9B9Cad11F036E1C76CDf42F89',
        collateralManager: '0x880cDaFA96Dd87FF0793B51f5B1d0F4DaB554305',
        usdc: '0x2B7144146F17Bcb6Fe314d98d653731850CD3665',
        veNFT: '0xDC52867e1e9F495a26075Ea69B0Ea6E501222bB9',
        rwaNFT: '0x09dd2780Fdb2e4E9f47109063c367Df108C2774a',
        nftOracle: '0x61F914341a07B6A519D6F519b3B71c9e117b8010',
        loanManager: '0x880cDaFA96Dd87FF0793B51f5B1d0F4DaB554305',
        yieldDistributor: '0xf7f619cbEF4bC707897D20f6bd9a264d4e4Eb790',
        lens: '0x702A5d1139D5f06410df6847879372EA25e760CA',
    },
    [OP_SEPOLIA_CHAIN_ID]: {
        lendingPool: '0x0000000000000000000000000000000000000000',
        collateralManager: '0x0000000000000000000000000000000000000000',
        usdc: '0x0000000000000000000000000000000000000000',
        veNFT: '0x0000000000000000000000000000000000000000',
        rwaNFT: '0x0000000000000000000000000000000000000000',
        nftOracle: '0x0000000000000000000000000000000000000000',
        loanManager: '0x0000000000000000000000000000000000000000',
        yieldDistributor: '0x0000000000000000000000000000000000000000',
        lens: '0x0000000000000000000000000000000000000000',
    },
    [FOUNDRY_CHAIN_ID]: {
        lendingPool: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
        loanManager: '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
        yieldDistributor: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
        lens: '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e',
        usdc: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        veNFT: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
        rwaNFT: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
        nftOracle: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    }
} as const;

export const LENDING_POOL_ABI = YIFYLendingPoolV2;
export const LOAN_MANAGER_ABI = YIFYLoanManagerV2;
export const YIELD_DISTRIBUTOR_ABI = YIFYYieldDistributorV2;
export const LENS_ABI = YIFYLens;
export const VENFT_ABI = MockVeNFT;
export const RWANFT_ABI = MockRWANFT;
export const SIMPLE_ORACLE_ABI = SimpleNFTOracle;

export const MOCK_USDC_ABI = MockUSDC;
export const MOCK_VENFT_ABI = MockVeNFT;
export const MOCK_RWANFT_ABI = MockRWANFT;
export const MOCK_NFT_ABI = MockRWANFT; // Alias for backward compatibility

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
] as const;

export const ADMIN_CONTRACT_ADDRESSES = {
    31337: {
        yieldGenerator: '0xd75eC96794A60c6216E9bD222Ea5D6b50607C821',
    },
    4202: {
        yieldGenerator: '0x0000000000000000000000000000000000000000',
    }
} as const;

export const ERC20_ABI = erc20Abi;
export const ERC721_ABI = erc721Abi;
