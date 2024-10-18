import React, { useState, useEffect } from 'react';
import Dialog from './Dialog';
import Button from './Button';
import Input from './Input';
import Web3 from 'web3';
import getContractInstance from 'src/contract/ContractInstance';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

const AddAdminPopup = ({ isOpen, onClose, onAdd, selectedOrg }) => {
  console.log('selectedOrg', selectedOrg)
  const [newAdmin, setNewAdmin] = useState({ name: '', walletAddress: '', email: '', contactNumber: '' });
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
    setNewAdmin({ ...newAdmin, [name]: value });
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (newAdmin.name.trim() === '') {
      newErrors.name = 'Name is required';
    }
    if (newAdmin.walletAddress.trim() === '') {
      newErrors.walletAddress = 'Wallet Address is required';
    } else if (!Web3.utils.isAddress(newAdmin.walletAddress)) {
      newErrors.walletAddress = 'Invalid wallet address';
    }
    if (newAdmin.email.trim() === '') {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newAdmin.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (newAdmin.contactNumber.trim() === '') {
      newErrors.contactNumber = 'Contact Number is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setNewAdmin({ name: '', walletAddress: '', email: '', contactNumber: '' });
    setErrors({});
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

      const orgId = selectedOrg.orgId;

      const transactionResult = await contract.methods.addAdmin(orgId, newAdmin.walletAddress).send({
        from: account,
      });
      console.log("Blockchain transaction result:", transactionResult);

      const dbResponse = await axios.post("http://localhost:4000/user/admin", {
        name: newAdmin.name,
        walletAddress: newAdmin.walletAddress,
        email: newAdmin.email,
        contactNumber: newAdmin.contactNumber,
        role: 'ADMIN',
        user_type: 'ADMIN',
        orgId: selectedOrg.orgId,
        organizationId: selectedOrg._id
      });
      console.log("Database storage result:", dbResponse.data);

      onAdd({
        ...newAdmin,
        role: 'ADMIN',
        user_type: 'ADMIN',
        organizationId: selectedOrg._id
      });
      resetForm();
      onClose();
      toast.success(`Admin ${newAdmin.name} added successfully!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("Failed to add admin:", error);
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.message.includes('Transaction has been reverted by the EVM')) {
        errorMessage = 'This wallet address is already associated with a user. Please use a different wallet address.';
      } else if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      setErrors(prev => ({ ...prev, submit: errorMessage }));
      
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

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title={`Add Organization Admin`}>
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </div>
      )}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm mb-2" htmlFor="name">Admin Name</label>
        <Input id="name" type="text" name="name" value={newAdmin.name} onChange={handleChange} />
        {errors.name && <p className="text-red-500 text-xs italic mt-1">{errors.name}</p>}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm mb-2" htmlFor="walletAddress">Wallet Address</label>
        <Input id="walletAddress" type="text" name="walletAddress" value={newAdmin.walletAddress} onChange={handleChange} />
        {errors.walletAddress && <p className="text-red-500 text-xs italic mt-1">{errors.walletAddress}</p>}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm mb-2" htmlFor="email">Email</label>
        <Input id="email" type="email" name="email" value={newAdmin.email} onChange={handleChange} />
        {errors.email && <p className="text-red-500 text-xs italic mt-1">{errors.email}</p>}
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm mb-2" htmlFor="contactNumber">Contact Number</label>
        <Input id="contactNumber" type="text" name="contactNumber" value={newAdmin.contactNumber} onChange={handleChange} />
        {errors.contactNumber && <p className="text-red-500 text-xs italic mt-1">{errors.contactNumber}</p>}
      </div>
      {errors.contract && <p className="text-red-500 mb-4">{errors.contract}</p>}
      {errors.submit && <p className="text-red-500 mb-4">{errors.submit}</p>}
      <Button className="w-full" onClick={handleSubmit}>ADD ORGANIZATION ADMIN</Button>
    </Dialog>
  );
};

export default AddAdminPopup;