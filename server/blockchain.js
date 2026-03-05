const { ethers } = require("ethers");
require("dotenv").config();
const abi = require("./abi.json"); // This now uses the real file!

// 1. Connect to the Radmin VPN Network
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

// 2. Connect the Machine's Wallet (Signer)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// 3. Link to the Voting Contract
const votingContract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  abi,
  wallet,
);

module.exports = { votingContract, provider };
