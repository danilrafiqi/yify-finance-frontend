import { foundry, liskSepolia } from 'wagmi/chains';
import { erc20Abi, erc721Abi } from 'viem';
import YIFYLoanManagerV2 from './abis/YIFYLoanManagerV2.json';
import YIFYLendingPoolV2 from './abis/YIFYLendingPoolV2.json';
import YIFYYieldDistributorV2 from './abis/YIFYYieldDistributorV2.json';
import YIFYLens from './abis/YIFYLens.json';
import MockVeNFT from './abis/MockVeNFT.json';

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
        // V2 placeholders for legacy chain
        loanManager: '0x0000000000000000000000000000000000000000',
        yieldDistributor: '0x0000000000000000000000000000000000000000',
        lens: '0x0000000000000000000000000000000000000000',
    },
    [FOUNDRY_CHAIN_ID]: {
        lendingPool: '0xd6e1afe5cA8D00A2EFC01B89997abE2De47fdfAf',
        collateralManager: '0x0000000000000000000000000000000000000000', // Deprecated
        loanManager: '0x99dBE4AEa58E518C50a1c04aE9b48C9F6354612f',
        yieldDistributor: '0x6F6f570F45833E249e27022648a26F4076F48f78',
        lens: '0xD42912755319665397FF090fBB63B1a31aE87Cee',
        usdc: '0x457cCf29090fe5A24c19c1bc95F492168C0EaFdb',
        veNFT: '0x38a024C0b412B9d1db8BC398140D00F5Af3093D4',
        rwaNFT: '0x525C7063E7C20997BaaE9bDa922159152D0e8417',
        nftOracle: '0x5fc748f1FEb28d7b76fa1c6B07D8ba2d5535177c', // SimpleOracle
    }
} as const;

// Export ABIs without "as const" on property access to avoid TS1355
export const LENDING_POOL_ABI = YIFYLendingPoolV2;
export const LOAN_MANAGER_ABI = YIFYLoanManagerV2;
export const YIELD_DISTRIBUTOR_ABI = YIFYYieldDistributorV2;
export const LENS_ABI = YIFYLens;
export const VENFT_ABI = MockVeNFT;

export const ERC20_ABI = erc20Abi;
export const ERC721_ABI = erc721Abi;

import SimpleNFTOracle from './abis/SimpleNFTOracle.json';
export const SIMPLE_ORACLE_ABI = SimpleNFTOracle;

export const COLLATERAL_MANAGER_ABI = []; // Deprecated/Placeholder
