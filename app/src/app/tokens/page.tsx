// "use client"

// import Image from "next/image"
// import { Card, CardContent, CardFooter } from "../../components/ui/Card"
// import { Button } from "../../components/ui/Button"

// // Mock data for tokens
// const tokens = [
//   { id: 1, name: "MoonCoin", price: 0.0543, image: "placeholder.svg", color: "from-blue-500/10 to-purple-500/10" },
//   { id: 2, name: "GalacticToken", price: 1.2076, image: "/placeholder.svg", color: "from-green-500/10 to-teal-500/10" },
//   { id: 3, name: "QuantumCash", price: 0.8932, image: "/placeholder.svg", color: "from-red-500/10 to-pink-500/10" },
//   {
//     id: 4,
//     name: "NebulaNugget",
//     price: 0.1254,
//     image: "/placeholder.svg",
//     color: "from-yellow-500/10 to-orange-500/10",
//   },
//   { id: 5, name: "CosmoCredit", price: 2.5698, image: "/placeholder.svg", color: "from-indigo-500/10 to-blue-500/10" },
//   { id: 6, name: "AstroAsset", price: 0.3421, image: "/placeholder.svg", color: "from-purple-500/10 to-pink-500/10" },
//   { id: 7, name: "StellarShard", price: 0.0098, image: "/placeholder.svg", color: "from-teal-500/10 to-green-500/10" },
//   { id: 8, name: "VortexValue", price: 4.7654, image: "/placeholder.svg", color: "from-orange-500/10 to-red-500/10" },
// ]

// const TokenCard = ({ token }) => (
//   <Card className="bg-gray-900 border-gray-800 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-[#e6ff00]/10">
//     <CardContent className="p-0">
//       <div className="relative h-40 w-full">
//         <Image
//           src={token.image || "/placeholder.svg"}
//           alt={token.name}
//           layout="fill"
//           objectFit="cover"
//           className="transition-transform duration-300 ease-in-out transform hover:scale-105"
//         />
//       </div>
//       <div className={`p-4 bg-gradient-to-br ${token.color}`}>
//         <h3 className="text-lg font-semibold text-white mb-1">{token.name}</h3>
//         <p className="text-[#e6ff00] text-sm">Price: ${token.price.toFixed(4)} USD</p>
//       </div>
//     </CardContent>
//     <CardFooter className="bg-gray-900 p-3">
//       <Button
//         variant="ghost"
//         className="w-full text-[#e6ff00] hover:text-black hover:bg-[#e6ff00] transition-colors duration-300"
//       >
//         View Details
//       </Button>
//     </CardFooter>
//   </Card>
// )

// export default function TokensPage() {
//   return (
//     <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-6xl mx-auto">
//         <h1 className="text-4xl font-bold text-center mb-8 text-[#e6ff00] glitch-text">Newly Launched Tokens</h1>
//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
//           {tokens.map((token) => (
//             <TokenCard key={token.id} token={token} />
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }




"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

// Mock data for tokens
const tokens = [
  {
    id: 1,
    name: "MoonCoin",
    price: 0.0543,
    image:
    "https://cdn.iconscout.com/icon/free/png-512/free-coin-icon-download-in-svg-png-gif-file-formats--dollar-finance-money-investment-cash-black-friday-pack-festival-days-icons-2415455.png?f=webp&w=256",
    color: "from-blue-500/10 to-purple-500/10",
  },
  { id: 2, name: "GalacticToken", price: 1.2076, image: "https://cdn.iconscout.com/icon/free/png-512/free-coin-icon-download-in-svg-png-gif-file-formats--dollar-money-currncy-iconhub-pack-miscellaneous-icons-1093492.png?f=webp&w=256", color: "from-green-500/10 to-teal-500/10" },
  { id: 3, name: "QuantumCash", price: 0.8932, image: "https://cdn.iconscout.com/icon/free/png-512/free-coin-icon-download-in-svg-png-gif-file-formats--dollar-money-currncy-iconhub-pack-miscellaneous-icons-1093492.png?f=webp&w=256", color: "from-red-500/10 to-pink-500/10" },
  {
    id: 4,
    name: "NebulaNugget",
    price: 0.1254,
    image: "https://cdn.iconscout.com/icon/free/png-512/free-coin-icon-download-in-svg-png-gif-file-formats--dollar-money-currncy-iconhub-pack-miscellaneous-icons-1093492.png?f=webp&w=256",
    color: "from-yellow-500/10 to-orange-500/10",
  },
  { id: 5, name: "CosmoCredit", price: 2.5698, image: "https://cdn.iconscout.com/icon/free/png-512/free-coin-icon-download-in-svg-png-gif-file-formats--dollar-money-currncy-iconhub-pack-miscellaneous-icons-1093492.png?f=webp&w=256", color: "from-indigo-500/10 to-blue-500/10" },
  { id: 6, name: "AstroAsset", price: 0.3421, image: "https://cdn.iconscout.com/icon/free/png-512/free-coin-icon-download-in-svg-png-gif-file-formats--dollar-money-currncy-iconhub-pack-miscellaneous-icons-1093492.png?f=webp&w=256", color: "from-purple-500/10 to-pink-500/10" },
  { id: 7, name: "StellarShard", price: 0.0098, image: "https://cdn.iconscout.com/icon/free/png-512/free-coin-icon-download-in-svg-png-gif-file-formats--dollar-money-currncy-iconhub-pack-miscellaneous-icons-1093492.png?f=webp&w=256", color: "from-teal-500/10 to-green-500/10" },
  { id: 8, name: "VortexValue", price: 4.7654, image: "https://cdn.iconscout.com/icon/free/png-512/free-coin-icon-download-in-svg-png-gif-file-formats--dollar-money-currncy-iconhub-pack-miscellaneous-icons-1093492.png?f=webp&w=256", color: "from-orange-500/10 to-red-500/10" },
]
//@ts-ignore
const TokenCard = ({ token }) => {
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <Card className="bg-black/30 backdrop-filter backdrop-blur-sm border border-[#e6ff00]/20 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-[#e6ff00]/20">
      <CardContent className="p-0">
        <div className="relative h-40 w-full flex items-center justify-center">
          {!imageError && token.image.startsWith("http") ? (
            <img
              src={token.image || "/placeholder.svg"}
              alt={token.name}
              className="w-28 h-28 border-[#6b8100] rounded-full object-cover transition-transform duration-300 ease-in-out transform hover:scale-105"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full border rounded-full h-full flex items-center justify-center text-[#e6ff00] text-4xl font-bold">
              {token.name.charAt(0)}
            </div>
          )}
        </div>
        <div className={`p-4 `}>
          <h3 className="text-lg flex justify-center items-center font-semibold text-white mb-1">{token.name}</h3>
          <p className="text-[#e6ff00] flex justify-center items-center  text-sm">Price: ${token.price.toFixed(4)} USD</p>
        </div>
      </CardContent>
      <CardFooter className="bg-[#e6ff00]/5 p-3">
        <Button
          variant="ghost"
          className="w-full text-[#e6ff00] hover:text-black hover:bg-[#e6ff00] transition-colors duration-500"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function TokensPage() {
  return (
    <div className="min-h-screen bg-black py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-[#e6ff00] glitch-text">Newly Launched Tokens</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {tokens.map((token) => (
            <TokenCard key={token.id} token={token} />
          ))}
        </div>
      </div>
    </div>
  )
}