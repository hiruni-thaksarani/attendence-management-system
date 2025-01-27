'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Web3 from 'web3';
import { Connection } from '@solana/web3.js';
import { toast, ToastContainer } from 'react-toastify';
import { ChevronDownIcon } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState('');
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const router = useRouter();

  const truncateAddress = (address) => {
    return address.substring(0, 6) + "..." + address.substring(address.length - 4);
  };

  const checkWalletAvailability = () => {
    return {
      metamask: typeof window !== 'undefined' && window.ethereum,
      phantom: typeof window !== 'undefined' && window.solana?.isPhantom,
      trust: typeof window !== 'undefined' && window.trustwallet
    };
  };

  const initializeWallet = async (walletType) => {
    setIsConnecting(true);
    try {
      switch (walletType) {
        case 'metamask':
          if (window.ethereum) {
            const web3Instance = new Web3(window.ethereum);
            const accounts = await window.ethereum.request({ 
              method: 'eth_requestAccounts' 
            });
            return { 
              address: accounts[0], 
              web3: web3Instance,
              chain: 'eth'
            };
          }
          throw new Error('MetaMask not installed');

        case 'phantom':
          if (!window.solana?.isPhantom) {
            throw new Error('Phantom wallet not installed');
          }
          try {
            const resp = await window.solana.connect();
            const connection = new Connection('https://api.testnet.solana.com/');
            return { 
              address: resp.publicKey.toString(),
              connection,
              chain: 'solana'
            };
          } catch (err) {
            throw new Error(`Phantom connection failed: ${err.message}`);
          }

        case 'trust':
          if (!window.trustwallet) {
            throw new Error('Trust Wallet not installed');
          }
          try {
            const web3Instance = new Web3(window.trustwallet);
            const accounts = await window.trustwallet.request({ 
              method: 'eth_requestAccounts' 
            });
            return { 
              address: accounts[0], 
              web3: web3Instance,
              chain: 'eth'
            };
          } catch (err) {
            throw new Error(`Trust Wallet connection failed: ${err.message}`);
          }

        default:
          throw new Error('Unsupported wallet type');
      }
    } catch (error) {
      console.error('Wallet initialization error:', error);
      toast.error(`Failed to connect to ${walletType}: ${error.message}`);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const generateNonce = async () => {
    try {
      const response = await fetch('http://localhost:4000/auth/generate-nonce', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to generate nonce');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Nonce generation error:', error);
      toast.error('Failed to generate authentication nonce');
      throw error;
    }
  };

  const signMessage = async (address, nonce, token, walletType, walletData) => {
    try {
      let signature;
      const message = `Nonce: ${nonce}`;
      
      if (walletType.toLowerCase() === 'phantom') {
        const encodedMessage = new TextEncoder().encode(message);
        const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8');
        signature = Buffer.from(signedMessage.signature).toString('base64');
        
        const response = await fetch('http://localhost:4000/auth/verify-signature', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nonce,
            signature,
            address,
            token,
            walletType: 'phantom',
            chain: 'solana'  // Make sure to explicitly set chain as 'solana'
          }),
        });
  
        if (!response.ok) {
          throw new Error('Signature verification failed');
        }
  
        const data = await response.json();
        if (data.success) {
          localStorage.setItem('jwtToken', data.token);
          localStorage.setItem('walletType', 'phantom');
          localStorage.setItem('walletAddress', address);
          router.push('dashboard/owner?logged=true');
        } else {
          throw new Error(data.message || "Verification failed");
        }
      } else {
        // For MetaMask and Trust Wallet (both use eth_sign)
        signature = await walletData.web3.eth.personal.sign(message, address, '');
      }

      const response = await fetch('http://localhost:4000/auth/verify-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nonce,
          signature,
          address,
          token,
          walletType,
          chain: walletData.chain
        }),
      });

      if (!response.ok) {
        throw new Error('Signature verification failed');
      }

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('jwtToken', data.token);
        localStorage.setItem('walletType', walletType);
        localStorage.setItem('walletAddress', address);
        router.push('dashboard/owner?logged=true');
      } else {
        throw new Error(data.message || "Verification failed");
      }
    } catch (error) {
      console.error('Signature error:', error);
      toast.error("Login failed: " + error.message);
      throw error;
    }
  };

  // const connectWallet = async (walletType) => {
  //   console.log('Connecting wallet:', walletType);
  //   try {
  //     // setSelectedWallet(walletType);
  //     setShowWalletOptions(false);
      
  //     const walletData = await initializeWallet(walletType);
  //     setConnectedAddress(walletData.address);

  //     const nonceData = await generateNonce();
  //     const normalizedWalletType = walletType.toLowerCase().trim();
  //     if (!['metamask', 'phantom', 'trust'].includes(normalizedWalletType)) {
  //       throw new Error('Invalid wallet type');
  //     }

  //     setSelectedWallet(normalizedWalletType);
      
  //     await signMessage(
  //       walletData.address, 
  //       nonceData.nonce, 
  //       nonceData.token, 
  //       walletType,
  //       walletData
  //     );
  //   } catch (error) {
  //     console.error('Wallet connection failed:', error);
  //     setSelectedWallet(null);
  //     setConnectedAddress('');
  //   }
  // };

  const connectWallet = async (walletType) => {
    console.log('Connecting wallet:', walletType);
    try {
      setShowWalletOptions(false);
      
      const walletData = await initializeWallet(walletType);
      setConnectedAddress(walletData.address);
  
      const nonceData = await generateNonce();
      const normalizedWalletType = walletType.toLowerCase().trim();
      
      setSelectedWallet(normalizedWalletType);
      
      await signMessage(
        walletData.address, 
        nonceData.nonce, 
        nonceData.token, 
        normalizedWalletType,
        walletData
      );
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setSelectedWallet(null);
      setConnectedAddress('');
    }
  };

  const walletAvailability = checkWalletAvailability();

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="px-8 py-10 text-left shadow-md w-[550px] bg-indigo-50 rounded-xl">
        <h3 className="text-2xl font-semibold text-center">Login</h3>
        <div className="mt-4 text-center">
          <p>Connect your wallet to access the dashboard</p>
        </div>

        <div className="flex flex-col items-center mt-52">
          {!showWalletOptions ? (
            <button
              onClick={() => setShowWalletOptions(true)}
              disabled={isConnecting}
              className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900 w-full max-w-xs"
            >
              {connectedAddress ? 
                `Connected: ${truncateAddress(connectedAddress)}` : 
                'Connect Wallet'
              }
            </button>
          ) : (
            <div className="w-full max-w-xs space-y-2">
              {walletAvailability.metamask && (
                <button
                  onClick={() => connectWallet('metamask')}
                  className="px-6 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 w-full flex items-center justify-center gap-2"
                  disabled={isConnecting}
                >
                  {/* <img src="/metamask-icon.png" alt="MetaMask" className="w-5 h-5" /> */}
                  MetaMask
                </button>
              )}
              
              {walletAvailability.phantom && (
                <button
                  onClick={() => connectWallet('phantom')}
                  className="px-6 py-2 text-white bg-purple-500 rounded-lg hover:bg-purple-600 w-full flex items-center justify-center gap-2"
                  disabled={isConnecting}
                >
                  {/* <img src="/phantom-icon.png" alt="Phantom" className="w-5 h-5" /> */}
                  Phantom
                </button>
              )}
              
              {walletAvailability.trust && (
                <button
                  onClick={() => connectWallet('trust')}
                  className="px-6 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 w-full flex items-center justify-center gap-2"
                  disabled={isConnecting}
                >
                  {/* <img src="/trust-icon.png" alt="Trust Wallet" className="w-5 h-5" /> */}
                  Trust Wallet
                </button>
              )}

              <button
                onClick={() => setShowWalletOptions(false)}
                className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 w-full"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
      <ToastContainer 
        position="top-right" 
        autoClose={5000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
      />
    </div>
  );
};

export default LoginPage;