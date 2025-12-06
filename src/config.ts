
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, baseSepolia, optimismSepolia, liskSepolia, base, optimism, lisk } from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'YIFY Lending',
    projectId: 'de0aa002a4c70036a43d64585a59cf29',
    chains: [mainnet, sepolia, base, baseSepolia, optimism, optimismSepolia, lisk, liskSepolia],
    ssr: false, // If your dApp uses server side rendering (SSR)
});
