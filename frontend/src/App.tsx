import React, { useState } from 'react';
import TransactionForm from './components/TransactionForm';
import TransactionsList from './components/TransactionsList';
import TransactionDetails from './components/TransactionDetails';
import AuditLogTable from './components/AuditLogTable';
import { User, Transaction, AuditEntry } from './types';
import { mockUsers, mockTransactions, mockAuditLog } from './data/mockData';
import RegistrationForm from './components/RegistrationForm';

type View = 'login' | 'transactions' | 'create' | 'details' | 'audit';

function App() {
  const [currentView, setCurrentView] = useState<View>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(mockAuditLog);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string>('');
  const [secret, setSecret] = useState("");
  const [otpauthUrl, setOtpAuthUrl] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);
  const [userName, setUserName] = useState("");
  const [userToken, setUserToken] = useState("");
  const [verificationResult, setVerificationResult] = useState<null | boolean>(
    null
  );
  const [selectedRole, setSelectedRole] = useState<"initiator" | "signer">(
    "initiator"
  ); 

  const handleVerifyToken = async () => {
    try {
      const response = await fetch("http://localhost:3000/auth/verifyTOTPCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: userToken, secret }),
      });

      const data = await response.json();
      setVerificationResult(data.success);
      setCurrentUser({
        username: userName,
        role: selectedRole,
        id: Date.now().toString(),
      })
      setCurrentView('transactions');
    } catch (err) {
      console.error("Error verifying token:", err);
      setVerificationResult(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    // Fetch MFA secret from backend
    try {
      const response = await fetch("http://localhost:3000/auth/generateTOTP", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userName.trim() }),
      });

      const data = await response.json();

      setSecret(data.secret.base32);
      setOtpAuthUrl(data.secret.otpauth_url);
      setShowQRCode(true);
    } catch (err) {
      console.error("Error generating MFA secret:", err);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
  };

  const handleCreateTransaction = (transactionData: Omit<Transaction, 'id' | 'nonce' | 'signatures' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: `TX${(transactions.length + 1).toString().padStart(3, '0')}`,
      nonce: `${Date.now()}-TX${(transactions.length + 1).toString().padStart(3, '0')}`,
      signatures: mockUsers
        .filter(u => u.role === 'signer')
        .map(user => ({
          signerId: user.id,
          signerUsername: user.username,
          signedAt: new Date(),
          status: 'pending' as const,
        })),
      createdAt: new Date(),
    };

    setTransactions(prev => [...prev, newTransaction]);

    // Add audit entry
    const auditEntry: AuditEntry = {
      id: `A${(auditLog.length + 1).toString().padStart(3, '0')}`,
      transactionId: newTransaction.id,
      action: 'Transaction Created',
      userId: currentUser!.id,
      username: currentUser!.username,
      timestamp: new Date(),
      details: `Transaction ${newTransaction.id} created for ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(newTransaction.amount)}`,
    };

    setAuditLog(prev => [...prev, auditEntry]);
    setCurrentView('transactions');
  };

  const handleApproveTransaction = async (transactionId: string): Promise<void> => {
    setTransactions(prev => 
      prev.map(transaction => {
        if (transaction.id === transactionId) {
          const updatedSignatures = transaction.signatures.map(signature => {
            if (signature.signerId === currentUser!.id && signature.status === 'pending') {
              return {
                ...signature,
                status: 'signed' as const,
                signedAt: new Date(),
              };
            }
            return signature;
          });

          const signedCount = updatedSignatures.filter(sig => sig.status === 'signed').length;

          // Add audit entry
          const auditEntry: AuditEntry = {
            id: `A${(auditLog.length + 1).toString().padStart(3, '0')}`,
            transactionId,
            action: 'Signature Added',
            userId: currentUser!.id,
            username: currentUser!.username,
            timestamp: new Date(),
            details: `Signature ${signedCount} of ${transaction.requiredSignatures} added`,
          };

          setAuditLog(prev => [...prev, auditEntry]);

          return {
            ...transaction,
            signatures: updatedSignatures,
            status: signedCount >= transaction.requiredSignatures ? 'approved' as const : transaction.status,
          };
        }
        return transaction;
      })
    );
  };

  const handleViewDetails = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setCurrentView('details');
  };

  const selectedTransaction = transactions.find(t => t.id === selectedTransactionId);

  if (!currentUser) {
    return <RegistrationForm handleSubmit={handleSubmit} handleVerifyToken={handleVerifyToken} otpauthUrl = {otpauthUrl} showQRCode = {showQRCode} secret = {secret} userToken = {userToken} verificationResult = {verificationResult} setUserToken = {setUserToken} userName = {userName} setUserName = {setUserName} role = {selectedRole} setSelectedRole = {setSelectedRole} />;
  }

  switch (currentView) {
    case 'transactions':
      return (
        <TransactionsList
          transactions={transactions.filter(t => t.status === 'pending')}
          currentUser={currentUser}
          currentUserRole={currentUser.role}
          onViewDetails={handleViewDetails}
          onCreateNew={() => setCurrentView('create')}
          onViewAuditLog={() => setCurrentView('audit')}
          onLogout={handleLogout}
        />
      );

    case 'create':
      return (
        <TransactionForm
          onSubmit={handleCreateTransaction}
          onBack={() => setCurrentView('transactions')}
          currentUserId={currentUser.id}
        />
      );

    case 'details':
      if (!selectedTransaction) {
        return <div>Transaction not found</div>;
      }
      return (
        <TransactionDetails
          transaction={selectedTransaction}
          currentUser={currentUser}
          onApprove={handleApproveTransaction}
          onBack={() => setCurrentView('transactions')}
        />
      );

    case 'audit':
      return (
        <AuditLogTable
          auditLog={auditLog}
          transactions={transactions}
          onBack={() => setCurrentView('transactions')}
          onViewDetails={handleViewDetails}
        />
      );

    default:
      return <div>Invalid view</div>;
  }
}

export default App;