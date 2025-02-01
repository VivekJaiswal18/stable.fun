'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import ConnectButton from './ConnectButton'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleConnectWallet = () => {
    openAppKit()
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 bg-black/90 backdrop-blur-lg z-50 transition-transform duration-500 lg:hidden
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 text-[#e6ff00] hover:text-white transition-colors"
        >
          <X size={32} />
        </button>
        <nav className="flex flex-col items-center justify-center h-full gap-8">
          <Link 
            href="/" 
            className="text-[#e6ff00] text-2xl hover:text-white transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link 
            href="/tokens" 
            className="text-[#e6ff00] text-2xl hover:text-white transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Tokens
          </Link>
          <Link 
            href="/mint" 
            className="text-[#e6ff00] text-2xl hover:text-white transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Mint
          </Link>
          <Link 
            href="/market" 
            className="text-[#e6ff00] text-2xl hover:text-white transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Market
          </Link>
          <Link 
            href="/docs" 
            className="text-[#e6ff00] text-2xl hover:text-white transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Docs
          </Link>
        </nav>
      </div>

      {/* Desktop Navbar */}
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300
          ${scrolled ? 'py-2' : 'py-4 sm:py-6'}`}
      >
        <div 
          className={`mx-4 lg:mx-8 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl transition-all duration-300
            ${scrolled ? 
              'bg-black/30 backdrop-blur-lg border border-white/10 shadow-[0_0_15px_rgba(230,255,0,0.1)]' : 
              'bg-transparent'
            }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <Link 
              href="/" 
              className="relative group"
            >
              <span className="text-3xl sm:text-2xl jersey-10-regular font-bold text-white tracking-tighter hover:text-[#e6ff00] transition-colors">
                stable.fun
              </span>
              <span className="absolute -inset-x-2 -inset-y-1 border border-[#e6ff00]/0 group-hover:border-[#e6ff00]/50 rounded transition-all duration-300" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 sm:gap-8">
              <Link 
                href="/tokens" 
                className="text-white/80 hover:text-[#e6ff00] transition-colors relative group"
              >
                Tokens
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-[#e6ff00] transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link 
                href="/mint" 
                className="text-white/80 hover:text-[#e6ff00] transition-colors relative group"
              >
                Mint
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-[#e6ff00] transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link 
                href="/market" 
                className="text-white/80 hover:text-[#e6ff00] transition-colors relative group"
              >
                Market
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-[#e6ff00] transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link 
                href="/docs" 
                className="text-white/80 hover:text-[#e6ff00] transition-colors relative group"
              >
                Docs
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-[#e6ff00] transition-all duration-300 group-hover:w-full" />
              </Link>
              <div className="flex gap-4 ml-4">
                <Link
                  href="/app"
                  className="relative inline-flex overflow-hidden rounded px-4 sm:px-6 py-2 group hover:scale-105 transition-transform"
                >
                  <span className="absolute inset-0 bg-[#e6ff00]" />
                  <span className="absolute inset-0 bg-gradient-to-r from-[#e6ff00] to-[#ccff00]">
                    <span className="absolute inset-0 bg-[#e6ff00] mix-blend-overlay" />
                  </span>
                  <span className="relative font-bold text-black tracking-wide glitch-text-sm text-sm sm:text-base">
                    LAUNCH APP
                  </span>
                </Link>
                <ConnectButton/>
                {/* <WalletMultiButton style={{}} />
                <button 
                  onClick={handleConnectWallet}
                  className="relative inline-flex overflow-hidden rounded px-4 sm:px-6 py-2 group hover:scale-105 transition-transform"
                >
                  <span className="absolute inset-0 border-2 border-[#e6ff00] opacity-70" />
                  <span className="relative font-bold text-[#e6ff00] tracking-wide glitch-text-sm text-sm sm:text-base">
                    CONNECT
                  </span>
                </button> */}
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsOpen(true)}
              className="lg:hidden text-[#e6ff00] hover:text-white transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>
    </>
  )
}

export default Navbar

function openAppKit() {
  throw new Error('Function not implemented.')
}

