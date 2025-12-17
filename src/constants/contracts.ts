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
        lendingPool: '0x3Ad07461984BBEEDead79478f23f1B1Ee91C764E',
        collateralManager: '0xa8045De9e41715abEE627C911a9E4787A0d3B0AA',
        usdc: '0x702A5d1139D5f06410df6847879372EA25e760CA',
        veNFT: '0x1fA5d3AD4B704Ea32B962DF416F9886693b3ac11',
        rwaNFT: '0x8B3EF4b5987a92DB70762b6AFD1379fB6fed173f',
        nftOracle: '0xa326c6dC8B0Ed86117708A905b1f90Ea04A750BB',
        loanManager: '0xa8045De9e41715abEE627C911a9E4787A0d3B0AA',
        yieldDistributor: '0xf8805693B284ADB2794fE0B7d32151ed8f603D65',
        lens: '0x7177B1bAd1879E19cc5352a73E7bD58a6D5Ec34A',
    },
    [SEPOLIA_CHAIN_ID]: {
        lendingPool: '0x66fCF068d05418BA21909a0C841d8f4360833145',
        collateralManager: '0xe766aC589e3253EEd7b70D48Dc5B6124C6994c94',
        usdc: '0x5f8FE112a1D0E6031b6Ed2454387Fd8dcb0F164C',
        veNFT: '0x5E70231DCaDfFe2480b79Bd7fF4d326Adfc64001',
        rwaNFT: '0xAc1f808CeD76CCdd50AC7fFdefD3356CCD80c257',
        nftOracle: '0xfE803762F69632153D726cB4c60d79e753B7f48d',
        loanManager: '0xe766aC589e3253EEd7b70D48Dc5B6124C6994c94',
        yieldDistributor: '0xa3714220919A009E6440538d3Be248Ba81948a76',
        lens: '0x38c9D96Fa0375c9c0873C654cfEEa015dB9D5F4d',
    },
    [BASE_SEPOLIA_CHAIN_ID]: {
        lendingPool: '0xE73CCcce5555dc386b2e5CBCEE65483252446871',
        collateralManager: '0x274F69B00298d7b5351910466448BbE83eb93772',
        usdc: '0xf9054e612070F9016fcf9531ba39f804f3088f49',
        veNFT: '0x16690B68E40D8bbf339Be467c8E0353d86FCa741',
        rwaNFT: '0xD6a351988776b5359E6766b2f969D1E9fb581c12',
        nftOracle: '0x7bA10DC05840238Ac712081c2Eb0a32e7e1d13e6',
        loanManager: '0x274F69B00298d7b5351910466448BbE83eb93772',
        yieldDistributor: '0x01Be1ECE0017224d90cf6A539F23BAEDAf17F194',
        lens: '0x20a6CbC685EcA50D7c7f06E0a6C708bc8C800cc8',
    },
    [OP_SEPOLIA_CHAIN_ID]: {
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
    [FOUNDRY_CHAIN_ID]: {
        lendingPool: '0x49fd2BE640DB2910c2fAb69bB8531Ab6E76127ff',
        loanManager: '0x4631BCAbD6dF18D94796344963cB60d44a4136b6',
        yieldDistributor: '0x86A2EE8FAf9A840F7a2c64CA3d51209F9A02081D',
        lens: '0xA4899D35897033b927acFCf422bc745916139776',
        usdc: '0x2B0d36FACD61B71CC05ab8F3D2355ec3631C0dd5',
        veNFT: '0x46b142DD1E924FAb83eCc3c08e4D46E82f005e0E',
        rwaNFT: '0xfbC22278A96299D91d41C453234d97b4F5Eb9B2d',
        nftOracle: '0xC9a43158891282A2B1475592D5719c001986Aaec',
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
