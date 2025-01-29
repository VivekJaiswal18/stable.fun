import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'


// Get projectId from https://cloud.reown.com
// export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "b56e18d47c72ab683b10814fe9495694" // this is a public projectId only to use on localhost
export const projectId = "eff2c4bb1be5955816d841b9009db50f" // this is a public projectId only to use on localhost

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const networks = [solana, solanaTestnet, solanaDevnet] as [AppKitNetwork, ...AppKitNetwork[]]

// Set up Solana Adapter
export const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()]
})


// import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks'

// export const projectId = 'eff2c4bb1be5955816d841b9009db50f'
// export const networks = [solana, solanaTestnet, solanaDevnet]