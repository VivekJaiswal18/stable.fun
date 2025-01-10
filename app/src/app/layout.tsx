// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import WalletProvider from "./components/WalletProvider";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "Create Next App",
//   description: "Generated by create next app",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         {/* <WalletProvider> */}
//         {children}
//         {/* </WalletProvider> */}
//       </body>
//     </html>
//   );
// }


import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from './components/Navbar'
// import { AppKitProvider } from './components/WalletProvider'
// wallet adapter imports
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import AppWalletProvider from './components/AppWalletProvider';

// import Footer from './components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'stable.fun',
  description: 'Launch your token with ease',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head><link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com"/>
<link href="https://fonts.googleapis.com/css2?family=Jersey+15&display=swap" rel="stylesheet"/>
</head>
      <body className={`${inter.className} bg-gray-900 text-white`}>
        {/* <WalletProvider> */}
        {/* <AppKitProvider> */}
        <AppWalletProvider>
        <Navbar />
        <main>{children}</main>
        </AppWalletProvider>
        {/* <Footer /> */}
        {/* </WalletProvider> */}
        {/* </AppKitProvider> */}
      </body>
    </html>
  )
}
