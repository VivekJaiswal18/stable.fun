'use client'

import { useState } from 'react'
import { Loader2, Zap, Upload } from 'lucide-react'
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Label } from "../components/ui/Label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/Card"

export default function MintPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    // Implement your minting logic here
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulating API call
    setIsLoading(false)
    alert('Token minted successfully!') // Replace with proper feedback
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0])
    }
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-[#e6ff00] glitch-text">Mint Your Token</h1>
        <Card className="bg-gray-900 border-[#e6ff00]/20">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold text-[#e6ff00]">Token Details</CardTitle>
                <CardDescription className="text-gray-400">Fill in the details to mint your new token</CardDescription>
              </div>
              <div>
              <div className="relative w-24 h-24 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {logoFile ? (
                  <img
                    src={URL.createObjectURL(logoFile)}
                    alt="Token Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Upload className="w-8 h-8 text-gray-500 group-hover:text-[#e6ff00] transition-colors" />
                )}
                </div>
                <CardDescription className="flex text-lime pt-1 justify-center text-gray-400">Set Logo</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tokenName" className="text-[#e6ff00]">Token Name</Label>
                <Input
                  type="text"
                  id="tokenName"
                  className="bg-gray-800 border-gray-700 text-white focus:ring-[#e6ff00] focus:border-[#e6ff00]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tokenSymbol" className="text-[#e6ff00]">Token Symbol</Label>
                <Input
                  type="text"
                  id="tokenSymbol"
                  className="bg-gray-800 border-gray-700 text-white focus:ring-[#e6ff00] focus:border-[#e6ff00]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="initialSupply" className="text-[#e6ff00]">Initial Supply</Label>
                <Input
                  type="number"
                  id="initialSupply"
                  className="bg-gray-800 border-gray-700 text-white focus:ring-[#e6ff00] focus:border-[#e6ff00]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="decimals" className="text-[#e6ff00]">Decimals</Label>
                <Input
                  type="number"
                  id="decimals"
                  className="bg-gray-800 border-gray-700 text-white focus:ring-[#e6ff00] focus:border-[#e6ff00]"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#e6ff00] hover:bg-[#ccff00] text-black font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    Minting...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2" />
                    Mint Token
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className=" flex-col text-gray-400">
            <div>
            Make sure you have enough balance to cover gas fees.</div>
            <div>
            Coin data cannot be updated after creation.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

