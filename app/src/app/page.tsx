// 'use client'

// import { useEffect, useState } from 'react'
// import Image from 'next/image'
// import Link from 'next/link'

// export default function Home() {
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       setMousePosition({ x: e.clientX, y: e.clientY })
//     }
//     window.addEventListener('mousemove', handleMouseMove)
//     return () => window.removeEventListener('mousemove', handleMouseMove)
//   }, [])

//   return (
//     <div className="min-h-screen bg-black relative overflow-hidden">
//       {/* Grid Background */}
//       <div 
//         className="absolute inset-0" 
//         style={{
//           backgroundImage: 'linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)',
//           backgroundSize: '50px 50px',
//           opacity: 0.2
//         }}
//       />

//       {/* Navigation */}
//       <nav className="relative z-10 px-6 py-8">
//         <div className="max-w-7xl mx-auto flex justify-between items-center">
//           <div className="text-5xl jersey-15-regular font-bold tracking-tighter text-white">
//             stable.fun
//           </div>
//           <div className="flex gap-4">
//             <Link 
//               href="/app" 
//               className="bg-[#e6ff00] hover:bg-[#ccff00] text-black px-6 py-2 font-bold transition-all duration-300 hover:shadow-[0_0_20px_rgba(230,255,0,0.3)]"
//             >
//               LAUNCH APP
//             </Link>
//             <Link 
//               href="/contact" 
//               className="bg-black border border-[#e6ff00] text-[#e6ff00] px-6 py-2 font-bold hover:bg-[#e6ff00] hover:text-black transition-all duration-300"
//             >
//               CONTACT
//             </Link>
//           </div>
//         </div>
//       </nav>

//       {/* Main Content */}
//       <main className="relative z-10 px-6 mt-20">
//         <div className="max-w-7xl mx-auto">
//           <h1 className="text-[#e6ff00] text-7xl md:text-8xl font-bold leading-tight max-w-5xl mx-auto text-center mb-12 glitch-text">
//             Integrating Traditional Finance with Blockchain Technology
//           </h1>
//           <p className="text-2xl text-white/80 text-center max-w-3xl mx-auto mb-12">
//             for a Transparent and Inclusive Financial Future.
//           </p>
          
//           <div className="flex justify-center gap-6 mb-20">
//             <Link 
//               href="/app" 
//               className="bg-[#e6ff00] hover:bg-[#ccff00] text-black px-8 py-3 font-bold text-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(230,255,0,0.3)]"
//             >
//               LAUNCH APP
//             </Link>
//             <Link 
//               href="/docs" 
//               className="bg-black border border-[#e6ff00] text-[#e6ff00] px-8 py-3 font-bold text-lg hover:bg-[#e6ff00] hover:text-black transition-all duration-300"
//             >
//               OUR DOCS
//             </Link>
//           </div>

//           {/* Decorative Elements */}
//           <div className="flex justify-between items-center mt-20">
//             <div className="relative w-48 h-48 glitch-container">
//               <Image
//                 src="/placeholder.svg"
//                 alt="Decorative profile"
//                 width={192}
//                 height={192}
//                 className="glitch-image"
//               />
//               <div className="absolute top-0 right-0 w-8 h-8 bg-[#e6ff00]" />
//             </div>
//             <div className="relative w-48 h-48 glitch-container">
//               <Image
//                 src="/placeholder.svg"
//                 alt="Decorative profile"
//                 width={192}
//                 height={192}
//                 className="glitch-image"
//               />
//               <div className="absolute top-0 right-0 w-8 h-8 bg-[#e6ff00]" />
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Animated Gradient Orb */}
//       <div 
//         className="pointer-events-none fixed w-[500px] h-[500px] rounded-full"
//         style={{
//           background: 'radial-gradient(circle, rgba(230,255,0,0.1) 0%, rgba(230,255,0,0) 70%)',
//           left: mousePosition.x - 250,
//           top: mousePosition.y - 250,
//           transform: 'translate(-50%, -50%)',
//         }}
//       />
//     </div>
//   )
// }




'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import PopCultureImage from './components/Image'
// import  ConnectButton from './components/walletconnect'

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleConnectWallet = () => {
    openAppKit()
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Grid Background */}
      <div 
        className="absolute inset-0" 
        style={{
          backgroundImage: 'linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          opacity: 0.8
        }}
      />

      {/* Background Sketches */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Rocket (Launchpad symbol) */}
        <path 
          d="M50,250 Q75,225 100,250 L75,275 Z" 
          fill="none" 
          stroke="#e6ff00" 
          strokeWidth="2" 
          opacity="0.2"
          filter="url(#glow)"
          className="bg-sketch"
        />

        {/* Balance scale (Stability symbol) */}
        <path 
          d="M350,50 L375,75 L400,50 M350,50 L400,50 M375,75 L375,100" 
          fill="none" 
          stroke="#e6ff00" 
          strokeWidth="2" 
          opacity="0.2"
          filter="url(#glow)"
          className="bg-sketch"
        />

        {/* Doge face (Meme coin symbol) */}
        <path 
          d="M500,200 C525,187.5 550,187.5 575,200 C587.5,175 612.5,175 625,200 C650,187.5 675,187.5 700,200 L700,250 C675,262.5 650,262.5 625,250 C612.5,275 587.5,275 575,250 C550,262.5 525,262.5 500,250 Z" 
          fill="none" 
          stroke="#e6ff00" 
          strokeWidth="2" 
          opacity="0.2"
          filter="url(#glow)"
          className="bg-sketch"
        />

        {/* Blockchain */}
        <path 
          d="M50,400 L100,400 L100,425 L50,425 Z M125,412.5 L175,412.5 L175,437.5 L125,437.5 Z M200,400 L250,400 L250,425 L200,425 Z" 
          fill="none" 
          stroke="#e6ff00" 
          strokeWidth="2" 
          opacity="0.2"
          filter="url(#glow)"
          className="bg-sketch"
        />
        <path 
          d="M100,412.5 L125,425 M175,425 L200,412.5" 
          fill="none" 
          stroke="#e6ff00" 
          strokeWidth="2" 
          opacity="0.2"
          filter="url(#glow)"
          className="bg-sketch"
        />

        {/* Token symbol */}
        <circle 
          cx="600" 
          cy="350" 
          r="25" 
          fill="none" 
          stroke="#e6ff00" 
          strokeWidth="2" 
          opacity="0.2"
          filter="url(#glow)"
          className="bg-sketch"
        />
        <text 
          x="600" 
          y="360" 
          fontSize="20" 
          fill="#e6ff00" 
          textAnchor="middle" 
          opacity="0.2"
          filter="url(#glow)"
          className="bg-sketch"
        >
          $
        </text>
      </svg>

      {/* Main Content */}
      <main className="relative z-10 px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-[#e6ff00] text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight max-w-5xl mx-auto text-center mt-5 mb-6 sm:mb-12 glitch-text">
            {/* Integrating Traditional Finance with Blockchain Technology.  */}
            Fun is in Pumping with stable
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/80 text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            for a Transparent and Inclusive Financial Future.
            {/* with stable */}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-12 sm:mb-20">
            <Link 
              href="/app" 
              className="bg-[#e6ff00] hover:bg-[#ccff00] text-black px-8 py-3 font-bold text-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(230,255,0,0.3)] text-center"
            >
              LAUNCH APP
            </Link>
            <Link 
              href="/docs" 
              className="bg-black border border-[#e6ff00] text-[#e6ff00] px-8 py-3 font-bold text-lg hover:bg-[#e6ff00] hover:text-black transition-all duration-300 text-center"
            >
              OUR DOCS
            </Link>
            {/* <ConnectButton/> */}
          </div>

          {/* Pop Culture Image */}
          <PopCultureImage />

          {/* Decorative Elements */}
          <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-8 sm:gap-0 mt-12 sm:mt-20">
            <div className="relative w-36 h-36 sm:w-48 sm:h-48 glitch-container">
              <Image
                src="/placeholder.svg"
                alt="Decorative profile"
                width={192}
                height={192}
                className="glitch-image"
              />
              <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 bg-[#e6ff00]" />
            </div>
            <div className="relative w-36 h-36 sm:w-48 sm:h-48 glitch-container">
              <Image
                src="/placeholder.svg"
                alt="Decorative profile"
                width={192}
                height={192}
                className="glitch-image"
              />
              <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 bg-[#e6ff00]" />
            </div>
          </div>
        </div>
      </main>

      {/* Animated Gradient Orb */}
      <div 
        className="pointer-events-none fixed w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(230,255,0,0.1) 0%, rgba(230,255,0,0) 70%)',
          left: mousePosition.x - 150,
          top: mousePosition.y - 150,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  )
}

function openAppKit() {
  throw new Error('Function not implemented.')
}
