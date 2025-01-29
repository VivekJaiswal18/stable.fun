// 'use client'

// import { useEffect } from 'react'
// import {
//     useAppKitState,
//     useAppKitTheme,
//     useAppKitEvents,
//     useAppKitAccount,
//     useWalletInfo
//      } from '@reown/appkit/react'

// export const InfoList = () => {
//     const kitTheme = useAppKitTheme();
//     const state = useAppKitState();
//     //@ts-ignore
//     const {address, caipAddress, isConnected, embeddedWalletInfo} = useAppKitAccount();
//     const events = useAppKitEvents()
//     const walletInfo = useWalletInfo()

//     useEffect(() => {
//         console.log("Events: ", events);
//     }, [events]);

//   return (
//     < >
//         <section>
//             <h2>useAppKit</h2>
//             <pre>
//                 Address: {address}<br />
//                 caip Address: {caipAddress}<br />
//                 Connected: {isConnected.toString()}<br />
//                 Account Type: {embeddedWalletInfo?.accountType}<br />
//                 {embeddedWalletInfo?.user?.email && (`Email: ${embeddedWalletInfo?.user?.email}\n`)}
//                 {embeddedWalletInfo?.user?.username && (`Username: ${embeddedWalletInfo?.user?.username}\n`)}
//             </pre>
//         </section>

//         <section>
//             <h2>Theme</h2>
//             <pre>
//                 Theme: {kitTheme.themeMode}<br />
//             </pre>
//         </section>

//         <section>
//             <h2>State</h2>
//             <pre>
//                 activeChain: {state.activeChain}<br />
//                 loading: {state.loading.toString()}<br />
//                 open: {state.open.toString()}<br />
//             </pre>
//         </section>

//         <section>
//             <h2>WalletInfo</h2>
//             <pre>
//                 Name: {walletInfo.walletInfo?.name?.toString()}<br />
//             </pre>
//         </section>
//     </>
//   )
// }


'use client'

import { useEffect } from 'react'
import {
  useAppKitState,
  useAppKitTheme,
  useAppKitEvents,
  useAppKitAccount,
  useWalletInfo
} from '@reown/appkit/react';


const InfoList = () => {
  const kitTheme = useAppKitTheme()
  const state = useAppKitState()
  //@ts-ignore
  const { address, caipAddress, isConnected, embeddedWalletInfo } = useAppKitAccount()
  const events = useAppKitEvents()
  const walletInfo = useWalletInfo()

  useEffect(() => {
    console.log("Events: ", events)
  }, [events])

  return (
    <>
      <section>
        <h2>useAppKit</h2>
        <pre>
          Address: {address}<br />
          caip Address: {caipAddress}<br />
          Connected: {isConnected.toString()}<br />
          Account Type: {embeddedWalletInfo?.accountType}<br />
          {embeddedWalletInfo?.user?.email && (`Email: ${embeddedWalletInfo?.user?.email}\n`)}
          {embeddedWalletInfo?.user?.username && (`Username: ${embeddedWalletInfo?.user?.username}\n`)}
        </pre>
      </section>

      <section>
        <h2>Theme</h2>
        <pre>
          Theme: {kitTheme.themeMode}<br />
        </pre>
      </section>

      <section>
        <h2>State</h2>
        <pre>
          activeChain: {state.activeChain}<br />
          loading: {state.loading.toString()}<br />
          open: {state.open.toString()}<br />
        </pre>
      </section>

      <section>
        <h2>WalletInfo</h2>
        <pre>
          Name: {walletInfo.walletInfo?.name?.toString()}<br />
        </pre>
      </section>
    </>
  )
}

export default InfoList