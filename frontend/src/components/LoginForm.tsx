import React, { useState } from 'react';
import { User } from '../types';
import axios from 'axios';

interface LoginFormProps {
  onLogin: (user: User) => void;
}

export default function LoginForm({ onLogin}: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState<'initiator' | 'signer'>('initiator');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;


    if (true) {
      // onLogin(user);
    } else {
      // Create a mock user for demo purposes
      const newUser: User = {
        id: Date.now().toString(),
        username: username.trim(),
        role: selectedRole,
      };
      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-sm border max-w-md w-full">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Banking Transaction System
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="initiator"
                  checked={selectedRole === 'initiator'}
                  onChange={(e) => setSelectedRole(e.target.value as 'initiator')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Initiator</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="signer"
                  checked={selectedRole === 'signer'}
                  onChange={(e) => setSelectedRole(e.target.value as 'signer')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Signer</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}