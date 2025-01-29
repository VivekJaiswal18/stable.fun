// import React from 'react';
// import { useAppKit } from '@reown/appkit/react';

// const ConnectButton = () => {
//   const { connect, connected, disconnect, user } = useAppKit();

//   return (
//     <div>
//       {connected ? (
//         <button onClick={disconnect}>
//           Disconnect ({user?.name || 'Wallet'})
//         </button>
//       ) : (
//         <button onClick={connect}>Connect Wallet</button>
//       )}
//     </div>
//   );
// };

// export default ConnectButton;


// src/providers/reownProvider.tsx
// 'use client';

// import React, { PropsWithChildren } from 'react';
// import { createAppKit } from '@reown/appkit/react';
// import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
// import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';
// import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

// // Set up Solana Adapter
// const solanaWeb3JsAdapter = new SolanaAdapter({
//   wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
// });

// // Get your projectId from https://cloud.reown.com
// const projectId = 'eff2c4bb1be5955816d841b9009db50f';

// // Optional metadata
// const metadata = {
//   name: 'stable.fun',
//   description: 'AppKit Example',
//   url: 'https://reown.com/appkit',
//   icons: ['https://assets.reown.com/reown-profile-pic.png'],
// };

// // Initialize the Reown AppKit
// createAppKit({
//   adapters: [solanaWeb3JsAdapter],
//   networks: [solana, solanaTestnet, solanaDevnet],
//   metadata: metadata,
//   projectId,
//   features: {
//     analytics: true, // Optional
//   },
// });

// export const ReownProvider = ({ children }: PropsWithChildren) => {
//   return <>{children}</>;
// };


// src/app/components/walletconnectProvider.tsx
'use client';

import React, { PropsWithChildren, useEffect } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

// Metadata and project details
const projectId = 'eff2c4bb1be5955816d841b9009db50f';
const metadata = {
  name: 'stable.fun',
  description: 'AppKit Example',
  url: 'https://reown.com/appkit',
  icons: ['https://assets.reown.com/reown-profile-pic.png'],
};

export const ReownProvider = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    // Set up Solana Adapter
    const solanaWeb3JsAdapter = new SolanaAdapter({
      wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    });

    // Initialize Reown AppKit
    createAppKit({
      adapters: [solanaWeb3JsAdapter],
      networks: [solana, solanaTestnet, solanaDevnet],
      metadata,
      projectId,
      features: {
        analytics: true,
      },
    });
  }, []); // Only run once on mount

  return <>{children}</>;
};
