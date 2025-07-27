import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

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

app.post('/auth/verifyTOTPCode', (req, res) => {
    const { token, secret } = req.body;

    const isVerified = verifyMFA(token, secret);
    console.log(isVerified);
    res.json({ success: isVerified });
});


app.listen(3000, () => {
  console.log(`Server is running on 3000`);
});