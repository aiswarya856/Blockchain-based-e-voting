const { ethers } = require("ethers");

// This turns a plain email into a secure blockchain fingerprint
const generateVoterHash = (email) => {
  try {
    // Exactly what George asked for: keccak256(toUtf8Bytes(email))
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(email));
  } catch (error) {
    console.error("Hash generation failed:", error);
    return null;
  }
};

module.exports = { generateVoterHash };
