import React, { useState } from 'react';
import { Transaction } from '../types';

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id' | 'nonce' | 'signatures' | 'createdAt'>) => void;
  onBack: () => void;
  currentUserId: string;
}

export default function TransactionForm({ onSubmit, onBack, currentUserId }: TransactionFormProps) {
  const [amount, setAmount] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [purpose, setPurpose] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      amount: parseFloat(amount),
      beneficiary,
      purpose,
      initiatorId: currentUserId,
      status: 'pending',
      requiredSignatures: 3,
    });

    // Reset form
    setAmount('');
    setBeneficiary('');
    setPurpose('');
  };

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

          <form onSubmit={handleSubmit} className="space-y-4">
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
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Submit Transaction
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}