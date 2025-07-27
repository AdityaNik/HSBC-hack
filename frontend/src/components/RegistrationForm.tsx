import React from "react";
import QRCode from "react-qr-code";

interface RegistrationOptions {
  handleSubmit: (e: React.FormEvent) => void;
  handleVerifyToken: () => void;
  otpauthUrl: string;
  showQRCode: boolean;
  secret: string;
  userToken: string;
  verificationResult: null | boolean;
  setUserToken: (token: string) => void;
  userName: string;
  setUserName: (name: string) => void;
  role: 'initiator' | 'signer';
  setSelectedRole: (role: 'initiator' | 'signer') => void;
}


export default function RegistrationForm({handleSubmit, handleVerifyToken, otpauthUrl, showQRCode, secret, userToken, verificationResult, setUserToken, userName, setUserName, role, setSelectedRole}: RegistrationOptions) {
   

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-6">
      <div className="bg-white p-8 rounded-lg shadow-sm border max-w-md w-full">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Banking Transaction System
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
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
                  checked={role === "initiator"}
                  onChange={(e) =>
                    setSelectedRole(e.target.value as "initiator")
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Initiator</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="signer"
                  checked={role === "signer"}
                  onChange={(e) => setSelectedRole(e.target.value as "signer")}
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
            Login & Setup MFA
          </button>
        </form>
      </div>

      {showQRCode && (
        <div className="bg-white p-6 rounded-lg shadow-sm border max-w-md w-full text-center space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Scan QR in Google Authenticator
          </h2>
          <QRCode
            size={256}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            value={otpauthUrl}
            viewBox={`0 0 256 256`}
          />
          <p className="text-sm text-gray-600">
            Or manually enter this secret in your Authenticator app:
            <br />
            <code className="text-blue-600 break-words">{secret}</code>
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter 6-digit code from app
            </label>
            <input
              type="text"
              maxLength={6}
              value={userToken}
              onChange={(e) => setUserToken(e.target.value)}
              placeholder="123456"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleVerifyToken}
            className="mt-2 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
          >
            Verify & Proceed
          </button>

          {verificationResult !== null && (
            <p
              className={`mt-2 text-sm ${
                verificationResult ? "text-green-600" : "text-red-600"
              }`}
            >
              {verificationResult
                ? "✅ Verified successfully! You may proceed."
                : "❌ Invalid code. Try again."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
