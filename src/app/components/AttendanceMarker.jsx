import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Web3 from 'web3';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import getContractInstance from 'src/contract/ContractInstance';

const AttendanceMarker = ({ employeeid }) => {
  const [date, setDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [status, setStatus] = useState('unmarked');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const now = new Date();
    setDate(now.toLocaleDateString());
    setCurrentTime(now.toLocaleTimeString());

    checkAttendance();
    initializeContract();
  }, []);

  const initializeContract = async () => {
    try {
      const contractInstance = await getContractInstance();
      setContract(contractInstance);
    } catch (err) {
      console.error('Failed to initialize contract:', err);
      setError('Failed to initialize blockchain connection. Please make sure MetaMask is connected and on the correct network.');
    }
  };

  const checkAttendance = async () => {
    try {
        const employeeId = localStorage.getItem('userId');
      const response = await axios.get(`http://localhost:4000/attendance/history/${employeeId}`);
      console.log('response',response)
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

  const markAttendance = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];

      // Then, mark attendance on the blockchain
      const gasEstimate = await contract.methods.markAttendance().estimateGas({ from: account });
      const result = await contract.methods.markAttendance().send({
        from: account,
        gas: Math.ceil(gasEstimate * 1.2), // Add 20% buffer to gas estimate
      });
      const employeeId = localStorage.getItem('userId');
      // First, mark attendance in the backend
      const backendResponse = await axios.post(`http://localhost:4000/attendance/mark/${employeeId}`);
      setStatus(backendResponse.data.status);

      console.log('Blockchain transaction result:', result);

      toast.success('Attendance marked successfully on blockchain!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error('Error marking attendance:', err);
      setError('Failed to mark attendance. Please try again.');
      
      toast.error(`Failed to mark attendance: ${err.message}`, {
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
        return <button onClick={markAttendance} className="bg-green-500 text-white rounded-full p-2 w-8 h-8 flex items-center justify-center ml-[60px]">✓</button>;
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