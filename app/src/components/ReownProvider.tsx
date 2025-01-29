'use client'

import { useEffect, useState } from "react"
import { initializeAppKit, appKit } from "../lib/appkit"

export function ReownProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const init = async () => {
      if (!appKit) {
        await initializeAppKit()
      }
      setIsReady(true)
    }
    init()
  }, [])

  if (!isReady) {
    return <div>Initializing wallet...</div>
  }

  return <>{children}</>
}