"use client";
import React, { useState, useEffect } from 'react';
import Dialog from './Dialog';
import Button from './Button';
import Input from './Input';
import Web3 from 'web3';
import getContractInstance from 'src/contract/ContractInstance';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

const AddEmployeePopup = ({ isOpen, onClose, onAdd, selectedOrg }) => {
    const [newEmployee, setNewEmployee] = useState({ name: '', walletAddress: '', employeeNumber: '', email: '', contactNumber: '' });
    const [contract, setContract] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
  
    useEffect(() => {
      const initContract = async () => {
        try {
          const contractInstance = await getContractInstance();
          setContract(contractInstance);
          console.log("Contract instance initialized:", contractInstance);
        } catch (error) {
          console.error("Failed to initialize contract:", error);
          setError("Failed to initialize contract. Please make sure MetaMask is connected and on the correct network.");
        }
      };
      initContract();
    }, []);
  
    const handleChange = (e) => {
      setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
    };
  
    const handleSubmit = async () => {
      setError(null);
      setIsLoading(true);

      if (!contract) {
        setError("Contract not initialized. Please make sure MetaMask is connected and on the correct network.");
        return;
      }
  
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
  
        // Ensure the wallet address is valid
        if (!Web3.utils.isAddress(newEmployee.walletAddress)) {
          setError("Invalid wallet address");
          setIsLoading(false);
          return;
        }
  
        // Execute blockchain transaction
        const transactionResult = await contract.methods.addEmployee(newEmployee.walletAddress).send({
          from: account,
        });
        console.log("Blockchain transaction result:", transactionResult);

        const organizationId = localStorage.getItem('organizationId');
        console.log('organizationId',organizationId)
        const orgId = localStorage.getItem('orgId');
  
        // Store in database
        const dbResponse = await axios.post("http://localhost:4000/user/employee", {
          ...newEmployee,
          role: 'EMPLOYEE',
          user_type: 'EMPLOYEE',
          orgId: orgId,
          organizationId: organizationId
        });
        console.log("Database storage result:", dbResponse.data);
  
        onAdd({
          ...newEmployee,
          role: 'EMPLOYEE',
          user_type: 'EMPLOYEE',
          orgId: orgId,
          organizationId: organizationId
        });
        setNewEmployee({ name: '', walletAddress: '', employeeNumber: '', email: '', contactNumber: '' });
        onClose();

        toast.success(`Employee added successfully!`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        
      } catch (error) {
        console.error("Failed to add employee:", error);
        setError(`Failed to add employee: ${error.message || 'Unknown error'}`);

        toast.error(`Failed to add admin: ${error.message || 'Unknown error'}`, {
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
  
    return (
      <Dialog isOpen={isOpen} onClose={onClose} title={`Add Organization Employee`}>
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          </div>
        )}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm mb-2" htmlFor="name">Employee Name</label>
          <Input id="name" type="text" name="name" value={newEmployee.name} onChange={handleChange} />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm mb-2" htmlFor="walletAddress">Wallet Address</label>
          <Input id="walletAddress" type="text" name="walletAddress" value={newEmployee.walletAddress} onChange={handleChange} />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm mb-2" htmlFor="employeeNumber">Employee Number</label>
          <Input id="employeeNumber" type="text" name="employeeNumber" value={newEmployee.employeeNumber} onChange={handleChange} />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm mb-2" htmlFor="email">Email</label>
          <Input id="email" type="email" name="email" value={newEmployee.email} onChange={handleChange} />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm mb-2" htmlFor="contactNumber">Contact Number</label>
          <Input id="contactNumber" type="text" name="contactNumber" value={newEmployee.contactNumber} onChange={handleChange} />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <Button className="w-full" onClick={handleSubmit}>ADD ORGANIZATION EMPLOYEE</Button>
      </Dialog>
    );
  };
  
  export default AddEmployeePopup;