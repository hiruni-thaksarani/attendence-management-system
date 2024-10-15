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

    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        console.log('Connected to MetaMask');
        router.push(`/dashboard/employee`);
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
      const contract = await getContractInstance();
      const [user, org] = await contract.methods.getUserByAddress(address).call();

      const USER_ROLES = {
        '0': 'employee',
        '1': 'admin',
        '2': 'owner'
      };

      const userType = USER_ROLES[user.role];
      if (!userType) throw new Error('Invalid user role');

      router.push(`/dashboard/employee`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg w-[500px] bg-indigo-50 h-96">
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
            {isConnecting ? 'Connecting...' : connectedAddress ? 'Connected' : 'Connect Wallet'}
          </button>
        </div>

        {error && <p className="mt-4 text-xs text-red-500 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;

