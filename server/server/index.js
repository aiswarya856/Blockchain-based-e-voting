const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const db = require('./db.js'); 
const abi = require('./abi.json'); 
require('dotenv').config();

const app = express();

// --- 1. MIDDLEWARE ---
// Allows Amrin's frontend to talk to your server
app.use(cors());
app.use(express.json());

// --- 2. BLOCKCHAIN SETUP ---
// Connects your server to George's Ganache via Radmin IP
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

// Test Blockchain Connection
provider.getNetwork().then(net => {
    console.log(`🔗 SUCCESS: Connected to George's Blockchain (Radmin IP: ${process.env.RPC_URL})`);
}).catch(err => {
    console.log("❌ BLOCKCHAIN ERROR: Could not connect to George. Is his Ganache Hostname set to his Radmin IP?");
});

// --- 3. LOGIN ROUTE (MySQL) ---
app.post('/api/login', (req, res) => {
    const { student_id, password } = req.body;
    const sql = "SELECT * FROM users WHERE student_id = ?";
    
    db.query(sql, [student_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Plain text check (since you mentioned pass123)
        if (results.length > 0 && password === results[0].password_hash) {
            res.json({ 
                message: "Login Successful!", 
                student_id: results[0].student_id,
                has_voted: results[0].has_voted 
            });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    });
});

// --- 4. VOTING ROUTE (Blockchain + MySQL) ---
app.post('/api/vote', async (req, res) => {
    const { student_id, candidate_id } = req.body;

    try {
        // Step A: Send transaction to George's Blockchain
        console.log(`Processing vote for Candidate ${candidate_id}...`);
        const tx = await contract.vote(candidate_id);
        await tx.wait(); // Wait for block confirmation

        // Step B: Update MySQL so they can't vote again
        const sql = "UPDATE users SET has_voted = 1 WHERE student_id = ?";
        db.query(sql, [student_id], (err, result) => {
            if (err) throw err;
            res.json({ 
                message: "Vote recorded on Blockchain!", 
                txHash: tx.hash 
            });
        });

    } catch (error) {
        console.error("Voting Error:", error);
        res.status(500).json({ error: "Blockchain transaction failed" });
    }
});

// --- 5. STATUS ROUTE ---
app.get('/', (req, res) => {
    res.send("Voting Backend is Live!");
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n*****************************************`);
    console.log(`✅ SUCCESS: Server is running on Port ${PORT}`);
    console.log(`📢 Tell Amrin to use your Radmin IP:5000`);
    console.log(`*****************************************\n`);
});