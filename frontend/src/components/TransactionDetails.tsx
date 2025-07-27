import { useState } from 'react';
import { Transaction } from '../App';


interface User {
  id: string;
  role: string;
}

interface Signature {
  signerId: string;
  signerUsername: string;
  status: 'pending' | 'signed';
  signedAt?: string;
}

interface TransactionDetailsProps {
  transaction: Transaction;
  currentUser: User;
  onApprove: (transactionId: Transaction) => Promise<void>;
  onBack: () => void;
}



export default function TransactionDetails({
  transaction,
  currentUser,
  onApprove,
  onBack = () => console.log('Going back'),
}: TransactionDetailsProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleApprove = async () => {
    setIsApproving(true);
    await onApprove(transaction);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 3000);
    setIsApproving(false);
  };

  const currentUserSignature = transaction.selectedSigners.find(
    sig => sig.id === currentUser.id
  );

  const signedCount = transaction.selectedSigners.length;
  const isFullyApproved = signedCount >= transaction.requiredSignatures;

  // Only show button if user is a signer, has a pending signature, and transaction isn't fully approved
  const canApprove = () => {
    if (currentUser.role !== 'signer') return false;
    if (!currentUserSignature) return false;
    transaction.selectedSigners.forEach(signer => {
      if (signer.id === currentUser.id && signer.status === 'pending') return true;
    });
    return false;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {showFeedback && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md flex justify-between items-center">
            <span>Signature Submitted Successfully</span>
            <button
              onClick={() => setShowFeedback(false)}
              className="text-green-700 hover:text-green-900 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Transaction Details</h1>
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              Back to List
            </button>
          </div>

          {/* User Role Indicator */}
          <div className="mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              currentUser.role === 'signer' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              Role: {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                <p className="text-sm text-gray-900 mt-1">{transaction.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Beneficiary</label>
                <p className="text-sm text-gray-900 mt-1">{transaction.beneficiary}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Purpose</label>
                <p className="text-sm text-gray-900 mt-1">{transaction.purpose}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created</label>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Approval Status</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {signedCount}/{transaction.requiredSignatures} Required Signatures
              </span>
            </div>

            {isFullyApproved && (
              <div className="mb-4 text-green-700 bg-green-100 border border-green-300 rounded px-4 py-2 text-sm">
                ✅ This transaction has been fully approved.
              </div>
            )}

            <div className="space-y-3">
              {transaction.selectedSigners.map((signature) => (
                <div
                  key={signature.id}
                  className={`flex items-center justify-between p-3 border rounded-md ${
                    signature.id === currentUser.id 
                      ? 'border-blue-200 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 flex items-center">
                      {signature.username}
                      {signature.id === currentUser.id && (
                        <span className="ml-2 text-xs text-blue-600">(You)</span>
                      )}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      signature.status === 'signed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {signature.status === 'signed' ? '✅ Signed' : '⏳ Pending'}
                  </span>
                </div>
              ))}
            </div>

            {/* Only show the button if user is a signer and can approve */}
            {currentUser.role === 'signer' && canApprove() && (
              <div className="mt-6">
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isApproving ? 'Signing...' : '✍️ Sign Transaction'}
                </button>
              </div>
            )}

            {/* Show message for non-signers */}
            {currentUser.role !== 'signer' && (
              <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-600">
                  You can view this transaction but cannot sign it. Only users with 'signer' role can approve transactions.
                </p>
              </div>
            )}

            {/* Show message for signers who already signed */}
            {currentUser.role === 'signer' && currentUserSignature?.status === 'signed' && (
              <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">
                  ✅ You have already signed this transaction.
                </p>
              </div>
            )}

            {/* Show message for signers when transaction is fully approved */}
            {currentUser.role === 'signer' && isFullyApproved && currentUserSignature?.status === 'pending' && (
              <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  This transaction has already received all required signatures and is fully approved.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}