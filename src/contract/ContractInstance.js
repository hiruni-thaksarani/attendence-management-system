import Web3 from "web3";
import pocABI from "./pocABI.json";

const getContractInstance = async () => {
  const contractAddress = '0xe1284b8931c83396dE95473576ceC8E27D2b51b6';
  
  try {
    // Check which wallet is available
    const isTrustWallet = typeof window.trustwallet !== 'undefined';
    const isMetaMask = typeof window.ethereum !== 'undefined';
    
    console.log('Available wallets:', {
      trustwallet: isTrustWallet,
      metamask: isMetaMask
    });

    let provider;
    let accounts;

    if (isTrustWallet) {
      console.log('Attempting Trust Wallet connection...');
      try {
        await window.trustwallet.enable();
        provider = window.trustwallet;
        accounts = await provider.request({ method: 'eth_requestAccounts' });
        console.log('Trust Wallet connected, accounts:', accounts);
      } catch (error) {
        console.error('Trust Wallet connection failed:', error);
        throw error;
      }
    } else if (isMetaMask) {
      console.log('Attempting MetaMask connection...');
      try {
        provider = window.ethereum;
        accounts = await provider.request({ method: 'eth_requestAccounts' });
        console.log('MetaMask connected, accounts:', accounts);
      } catch (error) {
        console.error('MetaMask connection failed:', error);
        throw error;
      }
    } else {
      throw new Error("No compatible wallet found");
    }

    // Initialize Web3
    console.log('Initializing Web3...');
    const web3 = new Web3(provider);
    
    // Verify we can access the blockchain
    try {
      const networkId = await web3.eth.net.getId();
      console.log('Connected to network:', networkId);
    } catch (error) {
      console.error('Failed to get network ID:', error);
      throw error;
    }

    // Create contract instance
    console.log('Creating contract instance...');
    try {
      const contract = new web3.eth.Contract(pocABI, contractAddress);
      
      // Verify contract connection
      const methods = Object.keys(contract.methods);
      console.log('Contract methods available:', methods);
      
      return contract;
    } catch (error) {
      console.error('Contract creation failed:', error);
      throw error;
    }
  } catch (error) {
    console.error('Contract initialization failed:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw new Error(`Contract initialization failed: ${error.message}`);
  }
};

export default getContractInstance;