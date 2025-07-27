import { Transaction, User, AuditEntry } from '../types';

export const mockUsers: User[] = [
  { id: '1', username: 'initiator1', role: 'initiator' },
  { id: '2', username: 'signer1', role: 'signer' },
  { id: '3', username: 'signer2', role: 'signer' },
  { id: '4', username: 'signer3', role: 'signer' },
  { id: '5', username: 'signer4', role: 'signer' },
  { id: '6', username: 'signer5', role: 'signer' },
];

export const mockTransactions: Transaction[] = [
  {
    id: 'TX001',
    amount: 150000,
    beneficiary: 'Acme Corp Ltd',
    purpose: 'Equipment Purchase',
    nonce: '1704067200000-TX001',
    initiatorId: '1',
    status: 'pending',
    requiredSignatures: 3,
    signatures: [
      { signerId: '2', signerUsername: 'signer1', signedAt: new Date('2024-01-01T10:00:00'), status: 'signed' },
      { signerId: '3', signerUsername: 'signer2', signedAt: new Date('2024-01-01T11:00:00'), status: 'signed' },
      { signerId: '4', signerUsername: 'signer3', signedAt: new Date(), status: 'pending' },
      { signerId: '5', signerUsername: 'signer4', signedAt: new Date(), status: 'pending' },
      { signerId: '6', signerUsername: 'signer5', signedAt: new Date(), status: 'pending' },
    ],
    createdAt: new Date('2024-01-01T09:00:00'),
  },
  {
    id: 'TX002',
    amount: 75000,
    beneficiary: 'Tech Solutions Inc',
    purpose: 'Software License',
    nonce: '1704070800000-TX002',
    initiatorId: '1',
    status: 'pending',
    requiredSignatures: 3,
    signatures: [
      { signerId: '2', signerUsername: 'signer1', signedAt: new Date(), status: 'pending' },
      { signerId: '3', signerUsername: 'signer2', signedAt: new Date(), status: 'pending' },
      { signerId: '4', signerUsername: 'signer3', signedAt: new Date(), status: 'pending' },
      { signerId: '5', signerUsername: 'signer4', signedAt: new Date(), status: 'pending' },
      { signerId: '6', signerUsername: 'signer5', signedAt: new Date(), status: 'pending' },
    ],
    createdAt: new Date('2024-01-01T10:00:00'),
  },
];

export const mockAuditLog: AuditEntry[] = [
  {
    id: 'A001',
    transactionId: 'TX001',
    action: 'Transaction Created',
    userId: '1',
    username: 'initiator1',
    timestamp: new Date('2024-01-01T09:00:00'),
    details: 'Transaction TX001 created for $150,000',
  },
  {
    id: 'A002',
    transactionId: 'TX001',
    action: 'Signature Added',
    userId: '2',
    username: 'signer1',
    timestamp: new Date('2024-01-01T10:00:00'),
    details: 'Signature 1 of 3 added',
  },
  {
    id: 'A003',
    transactionId: 'TX001',
    action: 'Signature Added',
    userId: '3',
    username: 'signer2',
    timestamp: new Date('2024-01-01T11:00:00'),
    details: 'Signature 2 of 3 added',
  },
  {
    id: 'A004',
    transactionId: 'TX002',
    action: 'Transaction Created',
    userId: '1',
    username: 'initiator1',
    timestamp: new Date('2024-01-01T10:00:00'),
    details: 'Transaction TX002 created for $75,000',
  },
];