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

const AddAdminPopup = ({ isOpen, onClose, onAdd, selectedOrg }) => {
    console.log('selectedOrg',selectedOrg)
  const [newAdmin, setNewAdmin] = useState({ name: '', walletAddress: '', email: '', contactNumber: '' });
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
    setNewAdmin({ ...newAdmin, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError(null);
    setIsLoading(true);

    if (!contract) {
      setError("Contract not initialized. Please make sure MetaMask is connected and on the correct network.");
      setIsLoading(false);
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];

      // Convert orgId to bytes32
      const orgId = selectedOrg.orgId;

      // Ensure the wallet address is valid
      if (!Web3.utils.isAddress(newAdmin.walletAddress)) {
        setError("Invalid wallet address");
        setIsLoading(false);
        return;
      }

      // Estimate gas for the transaction
    //   let gasEstimate;
    //   try {
    //     gasEstimate = await contract.methods.addAdmin(orgId, newAdmin.walletAddress).estimateGas({ from: account });
    //     gasEstimate = Math.ceil(Number(gasEstimate) * 1.5).toString(); // Increase gas estimate by 50%
    //   } catch (gasError) {
    //     console.error("Gas estimation failed:", gasError);
    //     setError("Gas estimation failed. The transaction might fail.");
    //     return;
    //   }

      // Execute blockchain transaction
      const transactionResult = await contract.methods.addAdmin(orgId, newAdmin.walletAddress).send({
        from: account,
        // gas: gasEstimate,
      });
      console.log("Blockchain transaction result:", transactionResult);

      // Store in database
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
      setNewAdmin({ name: '', walletAddress: '', email: '', contactNumber: '' });
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
      setError(`Failed to add admin: ${error.message || 'Unknown error'}`);
      toast.error(`Failed to add admin: ${error.message || 'Unknown error'}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }finally {
        setIsLoading(false);
      }
    };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Add Organization Admin`}>
         {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </div>
      )}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm mb-2" htmlFor="name">Admin Name</label>
        <Input id="name" type="text" name="name" value={newAdmin.name} onChange={handleChange} />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm mb-2" htmlFor="walletAddress">Wallet Address</label>
        <Input id="walletAddress" type="text" name="walletAddress" value={newAdmin.walletAddress} onChange={handleChange} />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm mb-2" htmlFor="email">Email</label>
        <Input id="email" type="email" name="email" value={newAdmin.email} onChange={handleChange} />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm mb-2" htmlFor="contactNumber">Contact Number</label>
        <Input id="contactNumber" type="text" name="contactNumber" value={newAdmin.contactNumber} onChange={handleChange} />
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <Button className="w-full" onClick={handleSubmit}>ADD ORGANIZATION ADMIN</Button>
    </Dialog>
  );
};

export default AddAdminPopup;