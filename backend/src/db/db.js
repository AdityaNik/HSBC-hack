const SignerSchema = new mongoose.Schema({
  signer_id: {
    type: mongoose.Schema.Types.UUID,
    default: () => crypto.randomUUID(),
    unique: true,
  },
  name: {
    type: String,
    maxlength: 100,
  },
  email: {
    type: String,
    maxlength: 100,
  },
  totp_secret: {
    type: String,
    maxlength: 32,
  },
  key_share_hash: {
    type: String,
    maxlength: 64,
  },
  status: {
    type: String,
    enum: ["active", "suspended"],
    default: "active",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const TransactionSchema = new mongoose.Schema({
  tx_id: {
    type: mongoose.Schema.Types.UUID,
    default: () => crypto.randomUUID(),
    unique: true,
  },
  amount: {
    type: mongoose.Schema.Types.Decimal128,
  },
  from_account: {
    type: String,
    maxlength: 50,
  },
  to_account: {
    type: String,
    maxlength: 50,
  },
  creator_id: {
    type: mongoose.Schema.Types.UUID,
    required: true,
  },
  nonce: {
    type: Number,
    unique: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  expires_at: {
    type: Date,
  },
});

const TransactionSignatureSchema = new mongoose.Schema({
  signature_id: {
    type: mongoose.Schema.Types.UUID,
    default: () => crypto.randomUUID(),
    unique: true,
  },
  tx_id: {
    type: mongoose.Schema.Types.UUID,
    ref: "Transaction",
    required: true,
  },
  signer_id: {
    type: mongoose.Schema.Types.UUID,
    ref: "Signer",
    required: true,
  },
  partial_signature: {
    type: String,
  },
  signed_at: {
    type: Date,
    default: Date.now,
  },
  totp_used: {
    type: String,
    maxlength: 6,
  },
});

const TransactionSignature = mongoose.model(
  "TransactionSignature",
  TransactionSignatureSchema
);
const Transaction = mongoose.model("Transaction", TransactionSchema);
const Signer = mongoose.model("Signer", SignerSchema);
