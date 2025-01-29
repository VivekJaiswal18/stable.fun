// 'use client'
// import { useAppKit } from '@reown/appkit/react';
// export const ConnectButton = () => {

//   return (
//     <div >
        
//         <appkit-button />
//     </div>
//   )
// }


// import { useAppKit } from '@reown/appkit/react'

// export default function ConnectButton() {
//   // 4. Use modal hook
//   const { open } = useAppKit()

//   return (
//     <>
//       <button onClick={() => open()}>Open Connect Modal</button>
//       <button onClick={() => open({ view: 'Networks' })}>Open Network Modal</button>
//     </>
//   )
// }



'use client'

import { useEffect, useRef } from 'react'

const ConnectButton = () => {
  const buttonRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      buttonRef.current = document.createElement('appkit-button')
      const container = document.getElementById('appkit-button-container')
      if (container && !container.hasChildNodes()) {
        container.appendChild(buttonRef.current)
      }
    }
  }, [])

  return <div id="appkit-button-container" />
}

export default ConnectButton