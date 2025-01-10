// // App.tsx
// import { createAppKit } from '@reown/appkit/react'
// import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
// import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks'
// import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
// import { ReactNode } from 'react'

// // 0. Set up Solana Adapter
// const solanaWeb3JsAdapter = new SolanaAdapter({
//   wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()]
// })

// // 1. Get projectId from https://cloud.reown.com
// const projectId = 'eff2c4bb1be5955816d841b9009db50f'

// // 2. Create a metadata object - optional
// const metadata = {
//   name: 'AppKit',
//   description: 'AppKit Solana Example',
//   url: 'https://example.com', // origin must match your domain & subdomain
//   icons: ['https://avatars.githubusercontent.com/u/179229932']
// }

// // 3. Create modal
// createAppKit({
//   adapters: [solanaWeb3JsAdapter],
//   networks: [solana, solanaTestnet, solanaDevnet],
//   metadata: metadata,
//   projectId,
//   features: {
//     analytics: true // Optional - defaults to your Cloud configuration
//   }
// })

// interface WalletProviderProps {
//     children: ReactNode;
//   }
  
//   const WalletProvider = ({ children }: WalletProviderProps) => {
//     return <>{children}</>;
//   };
  
//   export default WalletProvider;




'use client'

import { ReactNode, useEffect } from 'react'
import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'

// Initialize the Solana Adapter
const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()]
})

// Metadata for your app
const metadata = {
  name: 'stable.fun',
  description: 'AppKit Example',
  url: 'https://your-domain.com', // Change to your domain
  icons: ['https://assets.reown.com/reown-profile-pic.png']
}

// Reown Project ID
const projectId = 'eff2c4bb1be5955816d841b9009db50f'

export function AppKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialize Reown's AppKit
    createAppKit({
      adapters: [solanaWeb3JsAdapter],
      networks: [solana, solanaTestnet, solanaDevnet],
      metadata,
      projectId,
      features: {
        analytics: true // Optional
      }
    })
  }, [])

  return <>{children}</>
}
