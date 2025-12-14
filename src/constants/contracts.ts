import { foundry, liskSepolia } from 'wagmi/chains';
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

export const CONTRACT_ADDRESSES = {
    [LISK_SEPOLIA_CHAIN_ID]: {
        lendingPool: '0x62B47cD77574E05F6aaD588d2BaB7cC60a74Bb7f',
        collateralManager: '0x5942917F8c14FeB38ce490206882E88382327E65',
        usdc: '0x98F7CBda6Fa296F9270b3a02A119d2F28B09d941',
        veNFT: '0xd7e8047d6434bCfaa028CddaB779AE3258D3c91d',
        rwaNFT: '0xb705C4BEF021C3Ffb6e37C87B1A6013Ca84EF614',
        nftOracle: '0x7616FBF5c3dA1B162a59C79642c052FBb10701c2',
        loanManager: '0x0000000000000000000000000000000000000000',
        yieldDistributor: '0x0000000000000000000000000000000000000000',
        lens: '0x0000000000000000000000000000000000000000',
    },
    [FOUNDRY_CHAIN_ID]: {
        lendingPool: '0x170Ebee767c91A21Fb7E677f6B853bceaB28c584',
        loanManager: '0x8B1007CbAE127A5210454b02Ecd2A3888d24Ec4E',
        yieldDistributor: '0xA20657F3CFC43713a13ACC52a3d0D7BB325671ec',
        lens: '0xD035D8D5075B6564569D4682618Ac69e550d3048',
        usdc: '0x1ed12f1B4816038d48f2A534d30871BEdef84F3a',
        veNFT: '0xC4a135E0494c2FAAD520386C662718A01dd439dB',
        rwaNFT: '0x36Bf8B967Ec47717dbA9cab7fced2f5859A31583',
        nftOracle: '0x8e1c4653e4d109927bdfda6fA1060270ce5788dB',
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
