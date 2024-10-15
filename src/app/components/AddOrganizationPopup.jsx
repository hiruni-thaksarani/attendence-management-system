import React, { useState, useEffect } from 'react';
import Dialog from './Dialog';
import Button from './Button';
import Input from './Input';
import Web3 from 'web3';
import getContractInstance from 'src/contract/ContractInstance';
import axios from 'axios';

const AddOrganizationPopup = ({ isOpen, onClose, onAdd }) => {
    const [newOrg, setNewOrg] = useState({ name: '', address: '', contact: '', registration: '' });
    const [contract, setContract] = useState(null);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const initContract = async () => {
        try {
          const contractInstance = await getContractInstance();
          setContract(contractInstance);
          console.log("Contract instance:", contractInstance);
        } catch (error) {
          console.error("Failed to initialize contract:", error);
          setError("Failed to initialize contract. Please make sure MetaMask is connected and on the correct network.");
        }
      };
      initContract();
    }, []);
  
    const handleChange = (e) => {
      setNewOrg({ ...newOrg, [e.target.name]: e.target.value });
    };
  
    const handleSubmit = async () => {
      setError(null);
      if (!contract) {
        setError("Contract not initialized. Please make sure MetaMask is connected and on the correct network.");
        return;
      }
  
      try {
        console.log("Starting handleSubmit...");
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        console.log("Using account:", account);
  
        const orgId = Web3.utils.keccak256(newOrg.name + Date.now());
        console.log("Generated orgId:", orgId);
  
        console.log("Preparing to call addOrganization...");
        const gasEstimate = await contract.methods.addOrganization(orgId).estimateGas({ from: account });
        console.log("Estimated gas:", gasEstimate);
  
        const result = await contract.methods.addOrganization(orgId).send({ 
          from: account,
          gas: Math.floor(gasEstimate * 1.2) // Adding 20% buffer to gas estimate
        });
        console.log("Blockchain transaction result:", result);
  
        const dbResponse = await axios.post("http://localhost:4000/organizations", {
          id: orgId,
          name: newOrg.name,
          address: newOrg.address,
          contactNumber: newOrg.contact,
          registrationNumber: newOrg.registration
        });
        console.log("Database storage result:", dbResponse.data);
  
        onAdd({...newOrg, id: orgId});
        setNewOrg({ name: '', address: '', contact: '', registration: '' });
        onClose();
      } catch (error) {
        console.error("Failed to add organization:", error);
        if (error.message) console.error("Error message:", error.message);
        if (error.stack) console.error("Error stack:", error.stack);
        if (error.code) console.error("Error code:", error.code);
        setError(`Failed to add organization: ${error.message || 'Unknown error'}`);
      }
    };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add New Organization">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
          Organization Name
        </label>
        <Input id="name" type="text" name="name" value={newOrg.name} onChange={handleChange} />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
          Address
        </label>
        <Input id="address" type="text" name="address" value={newOrg.address} onChange={handleChange} />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contact">
          Contact Number
        </label>
        <Input id="contact" type="text" name="contact" value={newOrg.contact} onChange={handleChange} />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="registration">
          Registration Number
        </label>
        <Input id="registration" type="text" name="registration" value={newOrg.registration} onChange={handleChange} />
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <Button onClick={handleSubmit}>ADD ORGANIZATION</Button>
    </Dialog>
  );
};

export default AddOrganizationPopup;