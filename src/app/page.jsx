// 'use client';
// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// export default function Home() {
//   const router = useRouter();

//   useEffect(() => {
//     router.push('/login');
//   }, []);

//   return null;
// }

// pages/index.js
'use client';
import { useState, useEffect } from 'react';
import Web3 from 'web3';

export default function Home() {
  const [web3, setWeb3] = useState(null);
  const [address, setAddress] = useState(null);
  const [nonce, setNonce] = useState(null);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      // Use MetaMask's provider when available
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
    } else {
      setError("Please install MetaMask!");
    }
  }, []);

  const connectWallet = async () => {
    setError(null);
    try {
      if (!web3) {
        throw new Error("Web3 is not initialized");
      }
      const accounts = await web3.eth.requestAccounts();
      setAddress(accounts[0]);

      // Fetch nonce from backend
      const response = await fetch('http://localhost:4000/auth/generate-nonce', {
        method: 'POST',
      });
      const data = await response.json();
      setNonce(data.nonce);
    } catch (error) {
      console.error('Error connecting to wallet', error);
      setError(error.message || "Failed to connect wallet");
    }
  };

  const signMessage = async () => {
    setError(null);
    try {
      if (!web3 || !address || !nonce) {
        throw new Error("Web3, address, or nonce is not initialized");
      }
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
        }),
      });
      const data = await response.json();
      if (data.success) {
        setToken(data.token);
        console.log('JWT Token:', data.token);
      } else {
        throw new Error("Signature verification failed");
      }
    } catch (error) {
      console.error('Error signing message', error);
      setError(error.message || "Failed to sign message");
    }
  };

  return (
    <div>
      <h1>Metamask Login with Next.js</h1>
      {error && <p style={{color: 'red'}}>{error}</p>}
      {!address ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <p>Address: {address}</p>
          <button onClick={signMessage}>Sign In</button>
        </>
      )}
      {token && <p>JWT Token: {token}</p>}
    </div>
  );
}