import Link from "next/link"

const Footer = () => {
  return (
    <footer className="bg-black border-t border-[#e6ff00]/20 pt-12 pb-4 px-4 sm:px-6 lg:px-8">
      <div className=" max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2  gap-8">
        <div className="justify-center">
          <h3 className="text-[#e6ff00] text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/app" className="text-white/70 hover:text-[#e6ff00] transition-colors">
                Launch App
              </Link>
            </li>
            <li>
              <Link href="/docs" className="text-white/70 hover:text-[#e6ff00] transition-colors">
                Documentation
              </Link>
            </li>
            <li>
              <Link href="/tokens" className="text-white/70 hover:text-[#e6ff00] transition-colors">
                Tokens
              </Link>
            </li>
            <li>
              <Link href="/market" className="text-white/70 hover:text-[#e6ff00] transition-colors">
                Market
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-[#e6ff00] text-lg font-semibold mb-4">Connect</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-white/70 hover:text-[#e6ff00] transition-colors">
                Twitter
              </a>
            </li>
            <li>
              <a href="#" className="text-white/70 hover:text-[#e6ff00] transition-colors">
                Discord
              </a>
            </li>
            <li>
              <a href="#" className="text-white/70 hover:text-[#e6ff00] transition-colors">
                Telegram
              </a>
            </li>
            <li>
              <a href="#" className="text-white/70 hover:text-[#e6ff00] transition-colors">
                Medium
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-[#e6ff00]/20 text-center">
        <p className="text-white/50">&copy; 2025 stable.fun. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer

