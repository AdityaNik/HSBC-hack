import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Transaction, User } from './db/db.js';
import {split, combine} from 'shamir-secret-sharing';


import {generateMFASecret, verifyMFA, generateMFAToken} from './MFAImplentation.js'; // Note: .js extension is required in ES Modules

const app = express();

dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

mongoose.connect('mongodb://localhost:27017/');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('connected to db');
});

app.post('/auth/generateTOTP', (req, res) => {
    const { userId } = req.body;
    console.log(userId);

    const ans = generateMFASecret(userId);
    console.log(ans);

    res.json({
        secret: ans
    })
});

app.post('/auth/verifyTOTPCode', async (req, res) => {
    const { token, secret, username, role, otpauthUrl } = req.body;

    const isVerified = verifyMFA(token, secret);
    console.log(isVerified);



    if(isVerified) {
        try {
            const user = await User.findOne({ username });
            if (!user) {
                const newUser = new User({
                    username: username,
                    role: role,
                    mfaSecret: {
                        base32: secret,
                        otpauth_url: otpauthUrl
                    }
                });
                await newUser.save();
            }
        } catch (err) {     
            console.error('Error saving user:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    res.json({ success: isVerified });
});

app.post('/createTransaction', async (req, res) => {
  try {
    const {
      amount,
      beneficiary,
      purpose,
      initiatorId,
      status,
      requiredSignatures,
      selectedSigners,
    } = req.body;
    if (
      !amount ||
      !beneficiary ||
      !purpose ||
      !initiatorId ||
      !selectedSigners?.length ||
      !requiredSignatures
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const secretToSplit = crypto.getRandomValues(32);
    const shares = await split(secretToSplit, selectedSigners.length, requiredSignatures);


    const newTransaction = new Transaction({
      amount,
      beneficiary,
      purpose,
      initiatorId,
      status: status || "pending",
      creator_id: initiatorId,
      required_signatures: requiredSignatures,
      selected_signers: selectedSigners, // Store selected signers for tracking
    });


    for (let i = 0; i < selectedSigners.length; i++) {
      const signer = selectedSigners[i];
      const user = await User.findOne({ username: signer.id });

      if (!user) {
        return res.status(400).json({ error: `Signer ${signer.id} not found` });
      }
      user.key_share_hash = shares[i].toString('hex');
      await user.save();
    }
    await newTransaction.save();

    return res.status(201).json(newTransaction);
  } catch (error) {
    console.error("Error creating transaction:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/approveTransaction', async (req, res) => {
  try {
    const { transactionId, signerId, username } = req.body;

    // Validate required fields
    if (!transactionId || !signerId || !username) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Fetch transaction (make sure `transactionId` is the correct _id or use .findById if needed)
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Check if signer is allowed
    const signerIndex = transaction.selected_signers.findIndex(s => s.id === signerId);
    if (signerIndex === -1) {
      return res.status(403).json({ error: "Unauthorized signer" });
    }

    // Prevent duplicate signing
    const alreadySigned = transaction.signatures.find(s => s.id === signerId);
    if (alreadySigned) {
      return res.status(400).json({ error: "Already signed" });
    }

    // Record the signature
    transaction.signatures.push({
      id: signerId,
      username,
      status: "signed",
      signedAt: new Date(),
    });

    // Optional: Update signer status inside selected_signers if you're tracking that
    transaction.selected_signers[signerIndex].status = "signed";

    // Optional: Check if required signatures are met
    if (transaction.signatures.length >= transaction.required_signatures) {
      transaction.status = "approved";
    }

    await transaction.save();
    return res.status(200).json({ success: true, updatedStatus: transaction.status });
  } catch (error) {
    console.error("Error approving transaction:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get('/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find({});
        res.json(transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/signers', async (req, res) => {
    try {
        const users = await User.find({ role: 'signer' });
        res.json(users);
    } catch (error) {
        console.error("Error fetching signers:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


app.listen(3000, () => {
  console.log(`Server is running on 3000`);
});