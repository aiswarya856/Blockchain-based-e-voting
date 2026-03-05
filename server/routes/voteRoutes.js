const express = require("express");
const router = express.Router();
const { votingContract } = require("../blockchain");
const { generateVoterHash } = require("../utils/voterUtils");

// 1. Is Voting Active?
router.get("/votingStatus", async (req, res) => {
  try {
    const isActive = await votingContract.votingActive(); // From ABI
    res.json({ active: isActive });
  } catch (err) {
    res.status(500).json({ error: "Blockchain connection failed" });
  }
});

// 2. Get Candidates
router.get("/getCandidates", async (req, res) => {
  try {
    // This logic depends on George's contract structure
    // Usually, we loop through IDs or call a getter
    const candidates = await votingContract.viewCandidate(1); // Example for ID 1
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch candidates" });
  }
});

// 3. Check if already voted
router.get("/hasVoted/:email", async (req, res) => {
  try {
    const hash = generateVoterHash(req.params.email);
    const alreadyVoted = await votingContract.voted(hash); // From ABI mapping
    res.json({ hasVoted: alreadyVoted });
  } catch (err) {
    res.status(500).json({ error: "Check failed" });
  }
});

// 4. THE VOTE (POST)
router.post("/vote", async (req, res) => {
  const { cid, email } = req.body;
  const voterHash = generateVoterHash(email);

  try {
    const tx = await votingContract.vote(cid, voterHash);
    await tx.wait(); // Wait for the block to be mined
    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    res.status(400).json({ error: "Transaction failed. Already voted?" });
  }
});

module.exports = router;
