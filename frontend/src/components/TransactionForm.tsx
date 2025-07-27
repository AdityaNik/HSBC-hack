import React, { useEffect, useState } from 'react';


interface Transaction {
  amount: number;
  beneficiary: string;
  purpose: string;
  initiatorId: string;
  status: string;
  requiredSignatures: number;
  selectedSigners: Singer[];
}

interface TransactionFormProps {
  onSubmit: (transaction: Transaction) => void;
  onBack: () => void;
  currentUserId: string;
}

interface Singer {
  id: string;
  username: string;
  status: 'pending' | 'signed' | 'rejected';
}

type Props = {
  onSubmit: (
    amount: number,
    beneficiary: string,
    purpose: string,
    initiatorId: string,
    status: string,
    selectedSigners: Singer[],
    requiredSignatures: number
  ) => Promise<void>;
  onBack: () => void;
  currentUserId: string;
};

export default function TransactionForm({ onSubmit, onBack, currentUserId }: Props) {
  const [amount, setAmount] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [purpose, setPurpose] = useState('');
  const [selectedSigners, setSelectedSigners] = useState<Singer[]>([]);
  const [showSignerSelection, setShowSignerSelection] = useState(false);
  const [availableSigners, setAvailableSigners] = useState<Singer[]>([]);

  useEffect(() => {
    // fetch signers from API or context
    const fetchSigners = async () => {
      const response = await fetch('http://localhost:3000/signers');
      const data = await response.json();
      setAvailableSigners(data);
    }
    fetchSigners();
  }, []);

  const handleSelectSigners = () => {
    // Validate form first
    if (!amount || !beneficiary || !purpose) {
      alert('Please fill in all required fields');
      return;
    }
    
    setShowSignerSelection(true);
  };

  const handleSignerToggle = (signerId: string, username: string) => {
    // id 
    setSelectedSigners(prev => {
      const index = prev.findIndex(signer => signer.id === signerId);
      if (index === -1) {
        return [...prev, { id: signerId, username: username, status: 'pending' }];
      } else {
        return [...prev.slice(0, index), ...prev.slice(index + 1)];
      }
    });
  };

  const handleFinalSubmit = () => {
    if (selectedSigners.length === 0) {
      alert('Please select at least one signer');
      return;
    }

    onSubmit(
      parseFloat(amount),
      beneficiary,
      purpose,
      currentUserId,
      'pending',
      selectedSigners,
      selectedSigners.length,
    );

    // Reset form
    setAmount('');
    setBeneficiary('');
    setPurpose('');
    setSelectedSigners([]);
    setShowSignerSelection(false);
  };

  const handleBackToForm = () => {
    setShowSignerSelection(false);
  };

  if (showSignerSelection) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Select Signers</h1>
              <button
                onClick={handleBackToForm}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                Back to Form
              </button>
            </div>

            {/* Transaction Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Transaction Summary</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div><span className="font-medium">Amount:</span> ${amount}</div>
                <div><span className="font-medium">Beneficiary:</span> {beneficiary}</div>
                <div><span className="font-medium">Purpose:</span> {purpose}</div>
              </div>
            </div>

            {/* Signer Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Select Required Signers ({selectedSigners.length} selected)
              </h3>
              
              <div className="space-y-3">
                {availableSigners
                  .filter(signer => signer.id !== currentUserId) // Don't show current user as signer option
                  .map(signer => (
                    <div
                      key={signer.id}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedSigners.some(s => s.id === signer.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleSignerToggle(signer.id, signer.username)}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedSigners.some(s => s.id === signer.id)}
                          onChange={() => handleSignerToggle(signer.id, signer.username)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{signer.username}</div>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleBackToForm}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Back to Form
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={selectedSigners.length === 0}
                className={`flex-1 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                  selectedSigners.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                }`}
              >
                Submit Transaction
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Create Transaction</h1>
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              Back to List
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Amount
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label htmlFor="beneficiary" className="block text-sm font-medium text-gray-700 mb-1">
                Beneficiary
              </label>
              <input
                id="beneficiary"
                type="text"
                value={beneficiary}
                onChange={(e) => setBeneficiary(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Beneficiary name"
                required
              />
            </div>

            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                Purpose/Description
              </label>
              <textarea
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Transaction purpose"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nonce/Timestamp
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-600">
                {Date.now()}-{Math.random().toString(36).substr(2, 9)}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSelectSigners}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Select Signers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}