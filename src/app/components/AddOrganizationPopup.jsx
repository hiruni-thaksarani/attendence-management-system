import React, { useState, useEffect } from 'react';
import Dialog from './Dialog';
import Button from './Button';
import Input from './Input';
import Web3 from 'web3';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import getContractInstance from 'src/contract/ContractInstance';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

const AddOrganizationPopup = ({ isOpen, onClose, onAdd }) => {
  const [newOrg, setNewOrg] = useState({ name: '', address: '', contact: '', registration: '' });
  const [errors, setErrors] = useState({});
  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [walletType, setWalletType] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);  

  useEffect(() => {
    // Get wallet info from localStorage
    const storedWalletType = localStorage.getItem('walletType');
    const storedWalletAddress = localStorage.getItem('walletAddress');
    setWalletType(storedWalletType);
    setWalletAddress(storedWalletAddress);

    const initContract = async () => {
      if (storedWalletType === 'metamask' || storedWalletType === 'trust') {
        try {
          console.log('Starting contract initialization for wallet type:', storedWalletType);
          
          // Clear any previous errors
          setErrors({});
          
          // Set loading state
          setIsLoading(true);
          
          const contractInstance = await getContractInstance();
          
          // Verify contract instance
          if (!contractInstance || !contractInstance.methods) {
            throw new Error('Invalid contract instance returned');
          }
          
          console.log('Contract initialized successfully');
          setContract(contractInstance);
          
        } catch (error) {
          console.error('Contract initialization error:', error);
          let errorMessage = 'Failed to initialize contract. ';
          
          if (error.message.includes('No compatible wallet')) {
            errorMessage += 'Please install or unlock your wallet.';
          } else if (error.message.includes('User rejected')) {
            errorMessage += 'Please authorize the connection.';
          } else if (error.message.includes('network')) {
            errorMessage += 'Please check your network connection.';
          } else {
            errorMessage += error.message;
          }
          
          setErrors(prev => ({ 
            ...prev, 
            contract: errorMessage
          }));
          
        } finally {
          setIsLoading(false);
        }
      }
    };

    initContract();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewOrg({ ...newOrg, [name]: value });
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

  const handleEthereumTransaction = async (orgId) => {
    try {
      let account;
      if (walletType === 'metamask') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        account = accounts[0];
      } else if (walletType === 'trust') {
        // Trust Wallet specific account request
        const accounts = await window.trustwallet.request({ method: 'eth_requestAccounts' });
        account = accounts[0];
        
        // Ensure Trust Wallet is on the correct network
        await window.trustwallet.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13882' }],
        });
      }

      if (!account) {
        throw new Error('No account found. Please authorize the wallet.');
      }

      // Create transaction
      const transaction = contract.methods.addOrganization(orgId);
      const gasEstimate = await transaction.estimateGas({ from: account });
      
      return await transaction.send({
        from: account,
        gas: Math.round(gasEstimate * 1.2),
      });
    } catch (error) {
      console.error('Transaction error:', error);
      if (error.code === 4100) {
        throw new Error('Please authorize the transaction in your wallet');
      }
      throw error;
    }
  };
  

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!walletType || !walletAddress) {
      setErrors(prev => ({ ...prev, submit: "No wallet connected. Please login again." }));
      return;
    }

    setIsLoading(true);

    try {
      const orgId = Web3.utils.padRight(Web3.utils.utf8ToHex(newOrg.name), 64);
      let transactionResult;

      // Handle transaction based on wallet type
      if (walletType === 'metamask' || walletType === 'trust') {
        if (!contract) {
          throw new Error('Contract not initialized');
        }
        transactionResult = await handleEthereumTransaction(orgId);
      } else if (walletType === 'phantom') {
        transactionResult = await handleSolanaTransaction(orgId);
      } else {
        throw new Error('Unsupported wallet type');
      }

      // Store in database
      const dbResponse = await axios.post("http://localhost:4000/organizations", {
        orgId: orgId,
        name: newOrg.name,
        address: newOrg.address,
        contactNumber: newOrg.contact,
        registrationNumber: newOrg.registration,
        walletType,
        walletAddress,
        transactionHash: transactionResult.transactionHash || transactionResult.signature
      });

      onAdd({ ...newOrg, id: orgId });
      resetForm();
      onClose();

      toast.success(`Organization ${newOrg.name} added successfully!`);
    } catch (error) {
      console.error("Failed to add organization:", error);
      setErrors(prev => ({ ...prev, submit: `Failed to add organization: ${error.message}` }));
      toast.error(`Failed to add organization: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setNewOrg({ name: '', address: '', contact: '', registration: '' });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Add New Organization">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </div>
      )}
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-4">
          Connected Wallet: {walletType} ({walletAddress?.substring(0, 6)}...{walletAddress?.substring(-4)})
        </div>
        <label className="block text-gray-700 text-sm mb-2" htmlFor="name">Organization Name</label>
        <Input id="name" type="text" name="name" value={newOrg.name} onChange={handleChange} />
        {errors.name && <p className="text-red-500 text-xs italic mt-1">{errors.name}</p>}
      </div>
      {/* Rest of the form fields remain the same */}
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