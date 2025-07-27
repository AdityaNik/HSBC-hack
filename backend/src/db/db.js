// db/db.js
import mongoose from "mongoose";
import crypto from "crypto";

// User Schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["initiator", "signer"],
    required: true,
  },
  mfaSecret: {
    base32: String,
    otpauth_url: String,
  },
  key_share_hash: String,
}, {
  timestamps: true
});

// Transaction Schema
const TransactionSchema = new mongoose.Schema({
  tx_id: {
    type: String,
    default: () => crypto.randomUUID(),
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  beneficiary: {
    type: String,
    maxlength: 100,
    required: true,
  },
  purpose: {
    type: String,
    maxlength: 500,
  },
  creator_id: {
    type: String, // UUID as string
    required: true,
  },
  required_signatures: {
    type: Number,
    default: 1,
  },
  signatures: [
    {
      id: {
        type: String,
        required: true,
      },
      username: String,
      status: {
        type: String,
        enum: ["pending", "signed", "rejected"],
        default: "pending",
      },
    }
  ],
  nonce: {
    type: String,
    unique: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  expires_at: Date,
}, {
  timestamps: true
});

// Models
export const User = mongoose.model("User", UserSchema);
export const Transaction = mongoose.model("Transaction", TransactionSchema);
