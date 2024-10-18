import React, { useState, useEffect } from 'react';
import Dialog from './Dialog';
import Button from './Button';
import Input from './Input';
import Web3 from 'web3';
import getContractInstance from 'src/contract/ContractInstance';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

const AddOrganizationPopup = ({ isOpen, onClose, onAdd }) => {
  const [newOrg, setNewOrg] = useState({ name: '', address: '', contact: '', registration: '' });
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
    setNewOrg({ ...newOrg, [name]: value });
    // Clear the error for this field when the user starts typing
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.entries(newOrg).forEach(([key, value]) => {
      if (value.trim() === '') {
        newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
      }
    });
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
  
      const orgId = Web3.utils.padRight(Web3.utils.utf8ToHex(newOrg.name), 64);
      console.log(orgId);
      console.log(account);
  
      const transactionResult = await contract.methods.addOrganization(orgId).send({
        from: account,
      });
      console.log("Blockchain transaction result:", transactionResult);

      const dbResponse = await axios.post("http://localhost:4000/organizations", {
        orgId: orgId,
        name: newOrg.name,
        address: newOrg.address,
        contactNumber: newOrg.contact,
        registrationNumber: newOrg.registration
      });
      console.log("Database storage result:", dbResponse.data);
  
      onAdd({ ...newOrg, id: orgId });
      setNewOrg({ name: '', address: '', contact: '', registration: '' });
      onClose();

      toast.success(`Organization ${newOrg.name} added successfully!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("Failed to add organization:", error);
      if (error.data) {
        console.error("Error data:", error.data);
      }
      setErrors(prev => ({ ...prev, submit: `Failed to add organization: ${error.message || 'Unknown error'}` }));

      toast.error(`Failed to add organization: ${error.message || 'Unknown error'}`, {
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
    <Dialog isOpen={isOpen} onClose={onClose} title="Add New Organization">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </div>
      )}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm mb-2" htmlFor="name">Organization Name</label>
        <Input id="name" type="text" name="name" value={newOrg.name} onChange={handleChange} />
        {errors.name && <p className="text-red-500 text-xs italic mt-1">{errors.name}</p>}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm mb-2" htmlFor="address">Address</label>
        <Input id="address" type="text" name="address" value={newOrg.address} onChange={handleChange} />
        {errors.address && <p className="text-red-500 text-xs italic mt-1">{errors.address}</p>}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm mb-2" htmlFor="contact">Contact Number</label>
        <Input id="contact" type="text" name="contact" value={newOrg.contact} onChange={handleChange} />
        {errors.contact && <p className="text-red-500 text-xs italic mt-1">{errors.contact}</p>}
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm mb-2" htmlFor="registration">Registration Number</label>
        <Input id="registration" type="text" name="registration" value={newOrg.registration} onChange={handleChange} />
        {errors.registration && <p className="text-red-500 text-xs italic mt-1">{errors.registration}</p>}
      </div>
      {errors.contract && <p className="text-red-500 mb-4">{errors.contract}</p>}
      {errors.submit && <p className="text-red-500 mb-4">{errors.submit}</p>}
      <Button className="w-full" onClick={handleSubmit}>ADD ORGANIZATION</Button>
    </Dialog>
  );
};

export default AddOrganizationPopup;