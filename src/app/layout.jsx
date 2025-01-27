'use client';
import { Poppins } from 'next/font/google'
import localFont from "next/font/local";
import { ThirdwebProvider, coinbaseWallet, embeddedWallet, metamaskWallet, walletConnect, localWallet } from "@thirdweb-dev/react";
import "./globals.css";
import ToastProvider from './components/ToastProvider';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
})

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${geistSans.variable} ${geistMono.variable} font-poppins antialiased`}
      >
        <ThirdwebProvider 
          // clientId="18f168f4642bb2154147980a5db8cafd"
          supportedWallets={[
            metamaskWallet(),
            coinbaseWallet({ recommended: true }),
            walletConnect(),
            localWallet(),
            embeddedWallet({
              auth: {
                options: [
                  "email",
                  "google",
                  "apple",
                  "facebook",
                ],
              },
            }),
          ]}
          activeChain="ethereum"
        >
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThirdwebProvider>
      </body>
    </html>
  );
}