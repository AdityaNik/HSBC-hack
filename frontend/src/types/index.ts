export interface User {
  id: string;
  username: string;
  role: 'initiator' | 'signer';
}

export interface Transaction {
  id: string;
  amount: number;
  beneficiary: string;
  purpose: string;
  nonce: string;
  initiatorId: string;
  status: 'pending' | 'approved' | 'rejected';
  requiredSignatures: number;
  signatures: Signature[];
  createdAt: Date;
}

export interface Signature {
  signerId: string;
  signerUsername: string;
  signedAt: Date;
  status: 'signed' | 'pending';
}

export interface AuditEntry {
  id: string;
  transactionId: string;
  action: string;
  userId: string;
  username: string;
  timestamp: Date;
  details: string;
}