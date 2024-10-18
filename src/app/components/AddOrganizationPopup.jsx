import React, { useState, useEffect } from 'react';
import Dialog from './Dialog';
import Button from './Button';
import Input from './Input';
import Web3 from 'web3';
import getContractInstance from 'src/contract/ContractInstance';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react'; // Import the Loader2 icon from lucide-react


const AddOrganizationPopup = ({ isOpen, onClose, onAdd }) => {
  const [newOrg, setNewOrg] = useState({ name: '', address: '', contact: '', registration: '' });
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
    setNewOrg({ ...newOrg, [e.target.name]: e.target.value });
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
  
      const orgId = Web3.utils.padRight(Web3.utils.utf8ToHex(newOrg.name), 64);
      console.log(orgId);
      console.log(account);
  
    //   let gasEstimate;
    //   try {
    //     gasEstimate = await contract.methods.addOrganization(orgId).estimateGas({ from: account });
    //     gasEstimate = Math.ceil(Number(gasEstimate) * 2).toString();
    //   } catch (gasError) {
    //     console.error("Gas estimation failed:", gasError);
    //     setError("Gas estimation failed.");
    //     setIsLoading(false);
    //     return;
    //   }
  
      const transactionResult = await contract.methods.addOrganization(orgId).send({
        from: account,
        // gas: gasEstimate,
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

      // Display success toast message
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
      setError(`Failed to add organization: ${error.message || 'Unknown error'}`);

      // Display error toast message
      toast.error(`Failed to add organization: ${error.message || 'Unknown error'}`, {
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
    <Dialog isOpen={isOpen} onClose={onClose} title="Add New Organization">
        {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </div>
      )}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm mb-2" htmlFor="name">Organization Name</label>
        <Input id="name" type="text" name="name" value={newOrg.name} onChange={handleChange} />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm mb-2" htmlFor="address">Address</label>
        <Input id="address" type="text" name="address" value={newOrg.address} onChange={handleChange} />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm mb-2" htmlFor="contact">Contact Number</label>
        <Input id="contact" type="text" name="contact" value={newOrg.contact} onChange={handleChange} />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm mb-2" htmlFor="registration">Registration Number</label>
        <Input id="registration" type="text" name="registration" value={newOrg.registration} onChange={handleChange} />
      </div>
      {error && <p className="text-red-500 mb-4 ">{error}</p>}
      <Button className="w-full"onClick={handleSubmit}>ADD ORGANIZATION</Button>
    </Dialog>
  );
};

export default AddOrganizationPopup;
