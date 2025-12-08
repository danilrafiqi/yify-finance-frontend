import { foundry, liskSepolia } from 'wagmi/chains';
import { erc20Abi, erc721Abi } from 'viem';
import YIFYLoanManagerV2 from './abis/YIFYLoanManagerV2';
import YIFYLendingPoolV2 from './abis/YIFYLendingPoolV2';
import YIFYYieldDistributorV2 from './abis/YIFYYieldDistributorV2';
import YIFYLens from './abis/YIFYLens';
import MockVeNFT from './abis/MockVeNFT';
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
        // V2 placeholders for legacy chain
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
        nftOracle: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9', // SimpleOracle
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

export const SIMPLE_ORACLE_ABI = SimpleNFTOracle;


