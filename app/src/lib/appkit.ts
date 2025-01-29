import { createAppKit } from "@reown/appkit/react"
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { projectId, networks } from "@/config"

const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()]
})

export let appKit: ReturnType<typeof createAppKit> | null = null

export function initializeAppKit() {
  if (typeof window === 'undefined') return null
  
  if (!appKit) {
    appKit = createAppKit({
      adapters: [solanaWeb3JsAdapter],
      projectId,
      //@ts-ignore 
      networks,
      features: {
        analytics: true,
        email: true,
        socials: ['google', 'x', 'github', 'discord', 'farcaster'],
        emailShowWallets: true
      },
      themeMode: 'light'
    })
  }
  return appKit
}
