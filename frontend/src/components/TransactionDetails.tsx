import { useState } from 'react';
import { Transaction, User } from '../types';

interface TransactionDetailsProps {
  transaction: Transaction;
  currentUser: User;
  onApprove: (transactionId: string) => Promise<void>;
  onBack: () => void;
}

export default function TransactionDetails({
  transaction,
  currentUser,
  onApprove,
  onBack,
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
    await onApprove(transaction.id);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 3000);
    setIsApproving(false);
  };

  const currentUserSignature = transaction.signatures.find(
    sig => sig.signerId === currentUser.id
  );

  const signedCount = transaction.signatures.filter(sig => sig.status === 'signed').length;
  const isFullyApproved = signedCount >= transaction.requiredSignatures;

  
  const canApprove = currentUser.role === 'signer' &&
    currentUserSignature &&
    currentUserSignature.status === 'pending' &&
    !isFullyApproved;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {showFeedback && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md flex justify-between items-center">
            <span>Partial Signature Submitted</span>
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
                <label className="block text-sm font-medium text-gray-700">Nonce</label>
                <p className="text-sm text-gray-600 mt-1 font-mono">{transaction.nonce}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created</label>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(transaction.createdAt).toLocaleString()}
                </p>
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
                This transaction has been fully approved.
              </div>
            )}

            <div className="space-y-3">
              {transaction.signatures.map((signature) => (
                <div
                  key={signature.signerId}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {signature.signerUsername}
                    </p>
                    {signature.status === 'signed' && signature.signedAt && (
                      <p className="text-xs text-gray-500">
                        Signed at {new Date(signature.signedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      signature.status === 'signed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {signature.status === 'signed' ? 'Signed' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>

            {canApprove && (
              <div className="mt-6">
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                  {isApproving ? 'Approving...' : 'Approve Transaction'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
