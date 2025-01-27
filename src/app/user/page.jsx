'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Web3 from 'web3';
import { Connection } from '@solana/web3.js';

const LoginPage = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState('');
  const [error, setError] = useState('');
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
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
            return { 
              address: resp.publicKey.toString(),
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
            const accounts = await window.trustwallet.request({ 
              method: 'eth_requestAccounts' 
            });
            return { 
              address: accounts[0],
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
      setError(`Failed to connect to ${walletType}: ${error.message}`);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const getUserTypeAndRedirect = async (address, chain) => {
    try {
      const response = await fetch('http://localhost:4000/auth/verify-admin-employee-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          address,
          chain 
        }),
      });
  
      const result = await response.json();
      
      if (result.success) {
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('organizationId', result.organizationId);
        localStorage.setItem('orgId', result.orgId);
        localStorage.setItem('userId', result.userId);
        localStorage.setItem('walletType', selectedWallet);
        localStorage.setItem('walletAddress', address);
        
        if (result.role === 'ADMIN') {
          router.push('/dashboard/admin?logged=true');
        } else if (result.role === 'EMPLOYEE') {
          router.push('/dashboard/employee?logged=true');
        } else {
          throw new Error('Invalid user role');
        }
      } else {
        throw new Error(result.message || 'Verification failed');
      }
    } catch (err) {
      console.error('Error during user verification:', err);
      setError('Failed to verify user. Please try again.');
    }
  };

  const connectWallet = async (walletType) => {
    setError('');
    try {
      setSelectedWallet(walletType);
      setShowWalletOptions(false);
      
      const walletData = await initializeWallet(walletType);
      setConnectedAddress(walletData.address);
      
      await getUserTypeAndRedirect(walletData.address, walletData.chain);
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setSelectedWallet(null);
      setConnectedAddress('');
      setError(error.message);
    }
  };

  const walletAvailability = checkWalletAvailability();

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="px-8 py-10 text-left shadow-md w-[550px] bg-indigo-50 rounded-xl">
        <h3 className="text-2xl font-bold text-center">Login</h3>
        <div className="mt-4 text-center">
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Veritatis illo ullam officia necessitatibus</p>
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
                  MetaMask
                </button>
              )}
              
              {walletAvailability.phantom && (
                <button
                  onClick={() => connectWallet('phantom')}
                  className="px-6 py-2 text-white bg-purple-500 rounded-lg hover:bg-purple-600 w-full flex items-center justify-center gap-2"
                  disabled={isConnecting}
                >
                  Phantom
                </button>
              )}
              
              {walletAvailability.trust && (
                <button
                  onClick={() => connectWallet('trust')}
                  className="px-6 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 w-full flex items-center justify-center gap-2"
                  disabled={isConnecting}
                >
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

        {error && <p className="mt-4 text-xs text-red-500 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;