// 'use client'
// import { useDisconnect, useAppKit, useAppKitNetwork  } from '@reown/appkit/react'
// import { networks } from '@/config'

// export const ActionButtonList = () => {
//     const { disconnect } = useDisconnect();
//     const { open } = useAppKit();
//     const { switchNetwork } = useAppKitNetwork();

//     const handleDisconnect = async () => {
//       try {
//         await disconnect();
//       } catch (error) {
//         console.error("Failed to disconnect:", error);
//       }
//     }
//   return (
//     <div>
//         <button onClick={() => open()}>Open</button>
//         <button onClick={handleDisconnect}>Disconnect</button>
//         <button onClick={() => switchNetwork(networks[1]) }>Switch</button>
//     </div>
//   )
// }



'use client'

import { useEffect, useState } from 'react'
import { useDisconnect, useAppKit, useAppKitNetwork } from '@reown/appkit/react'
import { networks } from '@/config'
import { appKit } from '../lib/appkit'

const ActionButtonList = () => {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (appKit) {
      setIsReady(true)
    }
  }, [])

  // Only initialize hooks when appKit is ready
  const { disconnect } = isReady ? useDisconnect() : { disconnect: () => {} }
  const { open } = isReady ? useAppKit() : { open: () => {} }
  // const { switchNetwork } = isReady ? useAppKitNetwork() : { switchNetwork: () => {} }

  const handleDisconnect = async () => {
    if (!isReady) return
    try {
      await disconnect()
    } catch (error) {
      console.error("Failed to disconnect:", error)
    }
  }

  if (!isReady) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-x-2">
      <button 
        className="px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => open()}
      >
        Open
      </button>
      <button 
        className="px-4 py-2 bg-red-500 text-white rounded"
        onClick={handleDisconnect}
      >
        Disconnect
      </button>
      {/* <button 
        className="px-4 py-2 bg-green-500 text-white rounded"
        onClick={() => switchNetwork(networks[1])}
      >
        Switch Network
      </button> */}
    </div>
  )
}

export default ActionButtonList