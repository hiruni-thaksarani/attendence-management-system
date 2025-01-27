'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ConnectWallet, useAddress, useConnectionStatus, useWallet } from "@thirdweb-dev/react";
import { toast, ToastContainer } from 'react-toastify';

const LoginPage = () => {
  const router = useRouter();
  const address = useAddress();
  const connectionStatus = useConnectionStatus();
  const wallet = useWallet();

  const handleLogin = async () => {
    if (!address) {
      toast.error("Please connect your wallet first!");
      return;
    }

    try {
      // Fetch nonce and token from backend
      const response = await fetch('http://localhost:4000/auth/generate-nonce', {
        method: 'POST',
      });
      const data = await response.json();
      
      // Sign the message using Thirdweb's wallet
      const signature = await wallet?.signMessage(`Nonce: ${data.nonce}`);
      
      // Verify signature with backend
      const verifyResponse = await fetch('http://localhost:4000/auth/verify-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nonce: data.nonce,
          signature,
          address,
          token: data.token,
        }),
      });
      
      const verifyData = await verifyResponse.json();
      if (verifyData.success) {
        localStorage.setItem('jwtToken', verifyData.token);
        router.push('dashboard/owner?logged=true');
      } else {
        throw new Error(verifyData.message || "Signature verification failed");
      }
    } catch (error) {
      console.error('Error during login:', error);
      toast.error("Login failed. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="px-8 py-10 text-left shadow-md w-[550px] bg-indigo-50 rounded-xl">
        <h3 className="text-2xl font-semibold text-center">Login</h3>
        <div className="mt-4 text-center">
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Veritatis illo ullam officia necessitatibus</p>
        </div>

        <div className="flex flex-col items-center gap-4 mt-52">
          <ConnectWallet 
            theme="light"
            btnTitle="Connect Wallet"
          />
          {address && (
            <button
              onClick={handleLogin}
              disabled={connectionStatus !== "connected"}
              className={`px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900 
                ${connectionStatus !== "connected" ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Login with Wallet
            </button>
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