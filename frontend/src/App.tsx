import React, { useEffect, useState } from "react";
import TransactionForm from "./components/TransactionForm";
import TransactionsList from "./components/TransactionsList";
import TransactionDetails from "./components/TransactionDetails";
import AuditLogTable from "./components/AuditLogTable";
import { User, AuditEntry } from "./types";
import RegistrationForm from "./components/RegistrationForm";

interface Signer {
  id: string;
  username: string;
  status: 'pending' | 'signed' | 'rejected';
}

export interface Transaction {
  id: string;
  amount: number;
  beneficiary: string;
  purpose: string;
  initiatorId: string;
  status: string;
  requiredSignatures: number;
  selectedSigners: Signer[];
}

type View = "login" | "transactions" | "create" | "details" | "audit";

function App() {
  const [currentView, setCurrentView] = useState<
    "login" | "transactions" | "create" | "details" | "audit"
  >("login");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [selectedTransactionId, setSelectedTransactionId] =
    useState<string>("");
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

  useEffect(() => {
    // Fetch initial transactions and audit log
    const fetchData = async () => {
      const res = await fetch("http://localhost:3000/transactions");
      const data = await res.json();
      setTransactions(data);

      const auditLogRes = await fetch("http://localhost:3000/auditLog");
      const auditLogData = await auditLogRes.json();
      setAuditLog(auditLogData);
    };
    fetchData();
  }, []);

  const handleVerifyToken = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/auth/verifyTOTPCode",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: userToken,
            secret,
            username: userName,
            role: selectedRole,
            otpauthUrl,
          }),
        }
      );

      const data = await response.json();
      setVerificationResult(data.success);
      setCurrentUser({
        username: userName,
        role: selectedRole,
        id: Date.now().toString(),
      });
      setCurrentView("transactions");
    } catch (err) {
      console.error("Error verifying token:", err);
      setVerificationResult(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    try {
      const response = await fetch("http://localhost:3000/auth/generateTOTP", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const handleCreateTransaction = async (
    amount: number,
    beneficiary: string,
    purpose: string,
    selectedSigners: Signer[],
    requiredSignatures: number
  ): Promise<void> => {
    const res = await fetch("http://localhost:3000/createTransaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        beneficiary,
        purpose,
        initiatorId: currentUser!.id,
        status: "pending",
        requiredSignatures,
        selectedSigners,
      }),
    });

    const data = await res.json();
    console.log(data);

    setTransactions((prev) => [...prev, data]);

    setAuditLog((prev) => [
      ...prev,
      {
        id: `A${Date.now()}`,
        transactionId: data.id,
        action: "Transaction Created",
        userId: currentUser!.id,
        username: currentUser!.username,
        timestamp: new Date(),
        details: `Transaction ${data.id} created for ${data.amount}`,
      },
    ]);

    setCurrentView("transactions");
  };

  const handleApproveTransaction = async (transaction: Transaction) => {
    const res = await fetch("http://localhost:3000/approveTransaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transactionId: transaction.id,
        signerId: currentUser!.id,
        username: currentUser!.username,
      }),
    });

    const data = await res.json();
    console.log(data);
  };

  const selectedTransaction = transactions.find(
    (t) => t.id === selectedTransactionId
  );

  if (!currentUser) {
    return (
      <RegistrationForm
        handleSubmit={handleSubmit}
        handleVerifyToken={handleVerifyToken}
        otpauthUrl={otpauthUrl}
        showQRCode={showQRCode}
        secret={secret}
        userToken={userToken}
        verificationResult={verificationResult}
        setUserToken={setUserToken}
        userName={userName}
        setUserName={setUserName}
        role={selectedRole}
        setSelectedRole={setSelectedRole}
      />
    );
  }

  switch (currentView) {
    case "transactions":
      return (
        <TransactionsList
          transactions={transactions}
          currentUser={currentUser}
          currentUserRole={currentUser.role}
          onViewDetails={(id) => {
            setSelectedTransactionId(id);
            setCurrentView("details");
          }}
          onCreateNew={() => setCurrentView("create")}
          onViewAuditLog={() => setCurrentView("audit")}
          onLogout={() => {
            setCurrentUser(null);
            setCurrentView("login");
          }}
        />
      );

    case "create":
      return (
        <TransactionForm
          onSubmit={handleCreateTransaction}
          onBack={() => setCurrentView("transactions")}
          currentUserId={currentUser.id}
        />
      );

    case "details":
      return selectedTransaction ? (
        <TransactionDetails
          transaction={selectedTransaction}
          currentUser={currentUser}
          onApprove={handleApproveTransaction}
          onBack={() => setCurrentView("transactions")}
        />
      ) : (
        <div>Transaction not found</div>
      );

    case "audit":
      return (
        <AuditLogTable
          auditLog={auditLog}
          transactions={transactions}
          onBack={() => setCurrentView("transactions")}
          onViewDetails={(id) => {
            setSelectedTransactionId(id);
            setCurrentView("details");
          }}
        />
      );

    default:
      return <div>Invalid view</div>;
  }
}

export default App;
