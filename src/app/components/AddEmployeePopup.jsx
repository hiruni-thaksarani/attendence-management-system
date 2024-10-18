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
  const [errors, setErrors] = useState({});
  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initContract = async () => {
      try {
        const contractInstance = await getContractInstance();
        setContract(contractInstance);
        console.log("Contract instance initialized:", contractInstance);
      } catch (error) {
        console.error("Failed to initialize contract:", error);
        setErrors(prev => ({ ...prev, contract: "Failed to initialize contract. Please make sure MetaMask is connected and on the correct network." }));
      }
    };
    initContract();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee({ ...newEmployee, [name]: value });
    // Clear the error for this field when the user starts typing
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (newEmployee.name.trim() === '') {
      newErrors.name = 'Name is required';
    }
    if (newEmployee.walletAddress.trim() === '') {
      newErrors.walletAddress = 'Wallet Address is required';
    } else if (!Web3.utils.isAddress(newEmployee.walletAddress)) {
      newErrors.walletAddress = 'Invalid wallet address';
    }
    if (newEmployee.employeeNumber.trim() === '') {
      newErrors.employeeNumber = 'Employee Number is required';
    }
    if (newEmployee.email.trim() === '') {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newEmployee.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (newEmployee.contactNumber.trim() === '') {
      newErrors.contactNumber = 'Contact Number is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    if (!contract) {
      setErrors(prev => ({ ...prev, contract: "Contract not initialized. Please make sure MetaMask is connected and on the correct network." }));
      setIsLoading(false);
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];

      // Execute blockchain transaction
      const transactionResult = await contract.methods.addEmployee(newEmployee.walletAddress).send({
        from: account,
      });
      console.log("Blockchain transaction result:", transactionResult);

      const organizationId = localStorage.getItem('organizationId');
      console.log('organizationId', organizationId)
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
      setErrors(prev => ({ ...prev, submit: `Failed to add employee: ${error.message || 'Unknown error'}` }));

      toast.error(`Failed to add employee: ${error.message || 'Unknown error'}`, {
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
        {errors.name && <p className="text-red-500 text-xs italic mt-1">{errors.name}</p>}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm mb-2" htmlFor="walletAddress">Wallet Address</label>
        <Input id="walletAddress" type="text" name="walletAddress" value={newEmployee.walletAddress} onChange={handleChange} />
        {errors.walletAddress && <p className="text-red-500 text-xs italic mt-1">{errors.walletAddress}</p>}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm mb-2" htmlFor="employeeNumber">Employee Number</label>
        <Input id="employeeNumber" type="text" name="employeeNumber" value={newEmployee.employeeNumber} onChange={handleChange} />
        {errors.employeeNumber && <p className="text-red-500 text-xs italic mt-1">{errors.employeeNumber}</p>}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm mb-2" htmlFor="email">Email</label>
        <Input id="email" type="email" name="email" value={newEmployee.email} onChange={handleChange} />
        {errors.email && <p className="text-red-500 text-xs italic mt-1">{errors.email}</p>}
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm mb-2" htmlFor="contactNumber">Contact Number</label>
        <Input id="contactNumber" type="text" name="contactNumber" value={newEmployee.contactNumber} onChange={handleChange} />
        {errors.contactNumber && <p className="text-red-500 text-xs italic mt-1">{errors.contactNumber}</p>}
      </div>
      {errors.contract && <p className="text-red-500 mb-4">{errors.contract}</p>}
      {errors.submit && <p className="text-red-500 mb-4">{errors.submit}</p>}
      <Button className="w-full" onClick={handleSubmit}>ADD ORGANIZATION EMPLOYEE</Button>
    </Dialog>
  );
};

export default AddEmployeePopup;