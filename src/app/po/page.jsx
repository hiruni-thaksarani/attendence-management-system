'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Web3 from 'web3';
import { toast, ToastContainer } from 'react-toastify';

const LoginPage = () => {
  const [web3, setWeb3] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState('');
  const [nonce, setNonce] = useState(null);
  const [nonceToken, setNonceToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
    } else {
      toast.error("Please install MetaMask!");
    }
  }, []);

  const truncateAddress = (address) => {
    return address.substring(0, 6) + "..." + address.substring(address.length - 4);
  };

  const connectWallet = async () => {
    setIsConnecting(true);

    if (web3) {
      try {
        const accounts = await web3.eth.requestAccounts();
        const address = accounts[0];
        console.log('Connected to MetaMask');
        setConnectedAddress(address);
        
        // Fetch nonce and token from backend
        const response = await fetch('http://localhost:4000/auth/generate-nonce', {
          method: 'POST',
        });
        const data = await response.json();
        setNonce(data.nonce);
        setNonceToken(data.token);

        await signMessage(address, data.nonce, data.token);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        toast.error('Failed to connect wallet. Please try again.');
      }
    } else {
      console.error('Web3 not initialized');
      toast.error('Please install MetaMask to connect your wallet.');
    }
    setIsConnecting(false);
  };

  const signMessage = async (address, nonce, token) => {
    try {
      const signature = await web3.eth.personal.sign(`Nonce: ${nonce}`, address, '');

      // Send signature to backend for verification
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
        }),
      });
      const data = await response.json();
      if (data.success) {
        console.log('JWT Token:', data.token);
        // Store the JWT token in localStorage or a secure cookie
        localStorage.setItem('jwtToken', data.token);
        // Navigate to dashboard with success parameter
        router.push('/dashboard/owner?success=true');
      } else {
        throw new Error(data.message || "Signature verification failed");
      }
    } catch (error) {
      console.error('Error signing message', error);
      toast.error("Login failed. Connect to a valid account.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="px-8 py-10 text-left shadow-md w-[550px] bg-indigo-50 rounded-xl">
        <h3 className="text-2xl font-semibold text-center">Login</h3>
        <div className="mt-4 text-center">
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Veritatis illo ullam officia necessitatibus </p>
        </div>

        <div className="flex justify-center mt-52">
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className={`px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900 ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isConnecting ? 'Connecting...' : connectedAddress ? `Connected: ${truncateAddress(connectedAddress)}` : 'Connect Wallet'}
          </button>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default LoginPage;