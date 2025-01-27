import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Web3 from 'web3';
import { Connection, Transaction } from '@solana/web3.js';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import getContractInstance from 'src/contract/ContractInstance';
import { useRouter } from 'next/navigation';

const AttendanceMarker = ({ employeeid, onAttendanceMarked }) => {
  const [date, setDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [status, setStatus] = useState('unmarked');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contract, setContract] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const now = new Date();
    setDate(now.toLocaleDateString());
    setCurrentTime(now.toLocaleTimeString());

    checkAuthenticationAndWallet();
    checkAttendance();
    initializeContract();
  }, []);

  const checkAuthenticationAndWallet = () => {
    const walletType = localStorage.getItem('walletType');
    const walletAddress = localStorage.getItem('walletAddress');
    const authToken = localStorage.getItem('authToken');

    if (!authToken || !walletType || !walletAddress) {
      toast.error('Session expired. Please login again.', {
        position: "top-right",
        autoClose: 5000,
      });
      // Clear any existing storage
      localStorage.clear();
      // Redirect to login
      router.push('/?sessionExpired=true');
      return false;
    }
    return true;
  };

  const initializeContract = async () => {
    try {
      const contractInstance = await getContractInstance();
      setContract(contractInstance);
    } catch (err) {
      console.error('Failed to initialize contract:', err);
      setError('Failed to initialize blockchain connection. Please make sure your wallet is connected and on the correct network.');
    }
  };

  const checkAttendance = async () => {
    try {
      const employeeId = localStorage.getItem('userId');
      const response = await axios.get(`http://localhost:4000/attendance/history/${employeeId}`);
      const todayAttendance = response.data.find(
        (record) => new Date(record.date).toDateString() === new Date().toDateString()
      );
      if (todayAttendance) {
        setStatus(todayAttendance.status);
      }
    } catch (err) {
      console.error('Error checking attendance:', err);
    }
  };

  const handleEthereumAttendance = async () => {
    if (!window.ethereum) {
      throw new Error('Ethereum wallet not connected');
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];

    const gasEstimate = await contract.methods.markAttendance().estimateGas({ from: account });
    return await contract.methods.markAttendance().send({
      from: account,
      gas: Math.ceil(gasEstimate * 1.2),
    });
  };

  const handleSolanaAttendance = async () => {
    if (!window.solana?.isPhantom) {
      throw new Error('Phantom wallet not connected');
    }

    const transaction = new Transaction().add(
      contract.methods.markAttendance().instructions()
    );

    const signature = await window.solana.signAndSendTransaction(transaction);
    await new Connection('https://api.mainnet-beta.solana.com')
      .confirmTransaction(signature.signature);
    
    return {
      signature: signature.signature,
      status: 'confirmed'
    };
  };

  const handleTrustWalletAttendance = async () => {
    if (!window.trustwallet) {
      throw new Error('Trust Wallet not connected');
    }

    const accounts = await window.trustwallet.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];

    const gasEstimate = await contract.methods.markAttendance().estimateGas({ from: account });
    return await contract.methods.markAttendance().send({
      from: account,
      gas: Math.ceil(gasEstimate * 1.2),
    });
  };

  const markAttendance = async () => {
    setIsLoading(true);
    setError('');
    
    // First check authentication
    if (!checkAuthenticationAndWallet()) {
      setIsLoading(false);
      return;
    }

    try {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const walletType = localStorage.getItem('walletType')?.toLowerCase();
      console.log('Current wallet type:', walletType);
      
      if (!walletType) {
        throw new Error('No wallet connected. Please login again.');
      }

      let result;
      if (walletType.includes('metamask')) {
        result = await handleEthereumAttendance();
      } else if (walletType.includes('phantom')) {
        result = await handleSolanaAttendance();
      } else if (walletType.includes('trust')) {
        result = await handleTrustWalletAttendance();
      } else {
        result = await handleTrustWalletAttendance();
        // throw new Error(`Unsupported wallet type: ${walletType}`);
      }

      const employeeId = localStorage.getItem('userId');
      const backendResponse = await axios.post(
        `http://localhost:4000/attendance/mark/${employeeId}`,
        { 
          transactionHash: result.signature || result.transactionHash,
          walletType
        }
      );

      setStatus(backendResponse.data.status);

      toast.success('Attendance marked successfully!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      if (onAttendanceMarked) {
        onAttendanceMarked();
      }
    } catch (err) {
      console.error('Error marking attendance:', err);
      const errorMessage = err.message || 'Failed to mark attendance. Please try again.';
      setError(errorMessage);
      
      if (errorMessage.includes('No wallet connected') || errorMessage.includes('wallet not connected')) {
        router.push('/?walletDisconnected=true');
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusButton = () => {
    if (isLoading) {
      return <Loader2 className="animate-spin h-6 w-6 text-blue-500" />;
    }
    switch (status) {
      case 'unmarked':
        return (
          <button 
            onClick={markAttendance} 
            className="bg-green-500 text-white rounded-full p-2 w-8 h-8 flex items-center justify-center ml-[60px]"
            disabled={isLoading}
          >✓</button>
        );
      case 'on-time':
        return <button className="bg-green-500 text-white rounded px-4 py-2">Marked on Time</button>;
      case 'late':
        return <button className="bg-orange-500 text-white rounded px-4 py-2">Marked Late</button>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white shadow-md border-solid	border-gray-300 rounded-lg p-4 w-48">
      <div className="mb-2">
        <span className="text-gray-500">Date</span>
        <p className="font-semibold">{date}</p>
      </div>
      <div className="mb-2">
        <span className="text-gray-500">Current Time</span>
        <p className="font-semibold">{currentTime}</p>
      </div>
      <div>
        <span className="text-gray-500">Mark</span>
        <div className="mt-1">{getStatusButton()}</div>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default AttendanceMarker;