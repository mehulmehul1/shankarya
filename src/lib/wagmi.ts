import { http, createConfig, createStorage } from 'wagmi'
import { base, mainnet, polygon } from 'wagmi/chains'
import { baseAccount, injected } from 'wagmi/connectors'

// Get Coinbase Developer Kit API Key from env
const cdkApiKey = import.meta.env?.VITE_CDP_API_KEY

export const config = createConfig({
    chains: [base, mainnet, polygon],
    connectors: [
        injected(),
        baseAccount({
            appName: 'Shankarya: Kutra Prem',
            // Enable Coinbase Smart Wallet in Base App
        }),
    ],
    storage: createStorage({
        storage: window.localStorage,
    }),
    ssr: false,
    transports: {
        [base.id]: http(),
        [mainnet.id]: http(),
        [polygon.id]: http(),
    },
})

declare module 'wagmi' {
    interface Register {
        config: typeof config
    }
}
