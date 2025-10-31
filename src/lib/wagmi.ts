import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors'

const projectId = 'your-walletconnect-project-id' // Replace with actual project ID

export const config = createConfig({
  chains: [base],
  connectors: [
    metaMask(),
    coinbaseWallet({
      appName: 'YIFY Lending',
      appLogoUrl: 'https://yify-lending.vercel.app/logo.png'
    }),
    walletConnect({
      projectId
    })
  ],
  transports: {
    [base.id]: http()
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
