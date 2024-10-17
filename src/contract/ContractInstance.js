import Web3 from "web3";
import pocABI from "./pocABI.json";

const getContractInstance = async () => {
  if (typeof window.ethereum !== 'undefined') {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const web3 = new Web3(window.ethereum);
    const contractAddress = '0xc139b8d837a47828c7862365ef5b0821743ea295';
    const acc = new web3.eth.Contract(pocABI, contractAddress);
    console.log('acc',acc.defaultChain);
    return acc;
  } else {
    throw new Error("Ethereum object not found, install MetaMask.");
  }
};

export default getContractInstance;