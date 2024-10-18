'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const truncateAddress = (address) => {
    return address.substring(0, 6) + "..." + address.substring(address.length - 4);
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError('');
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        console.log('Connected to MetaMask:', address);
        setConnectedAddress(address);
        
        await getUserTypeAndRedirect(address);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        setError('Failed to connect wallet. Please try again.');
      }
    } else {
      console.error('MetaMask not detected');
      setError('Please install MetaMask to connect your wallet.');
    }
    setIsConnecting(false);
  };

  const getUserTypeAndRedirect = async (address) => {
    try {
      console.log('Attempting to verify address:', address); // Add this line
      const response = await fetch('http://localhost:4000/auth/verify-admin-employee-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });
  
      const result = await response.json();
      console.log('Server response:', result); // Add this line
  
      if (result.success) {
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('organizationId', result.organizationId);
        localStorage.setItem('orgId', result.orgId);
        localStorage.setItem('userId', result.userId);

        console.log(result)
        
        if (result.role === 'ADMIN') {
          router.push(`/dashboard/admin?logged=true`);
        } else if (result.role === 'EMPLOYEE') {
          router.push(`/dashboard/employee?logged=true`);
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="px-8 py-10 text-left shadow-md w-[550px] bg-indigo-50 rounded-xl">
        <h3 className="text-2xl font-bold text-center">Login</h3>
        <div className="mt-4 text-center">
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Veritatis illo ullam officia necessitatibus </p>
        </div>

        {/* Center the button below the blue box */}
        <div className="flex justify-center mt-52">
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className={`px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900 ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isConnecting ? 'Connecting...' : connectedAddress ? `Connected: ${truncateAddress(connectedAddress)}` : 'Connect Wallet'}
          </button>
        </div>

        {error && <p className="mt-4 text-xs text-red-500 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;