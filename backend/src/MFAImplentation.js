import speakeasy from 'speakeasy';

export const generateMFASecret = (userId) => {
  return speakeasy.generateSecret({
    name: `HSBC-MultiSigner-${userId}`,
    length: 32
  });
};

export const generateMFAToken = (secret) => {
  return speakeasy.totp({
    secret: secret,
    encoding: 'base32',
    window: 2
  });
};

export const verifyMFA = (token, secret) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2 // Allow for time drift
  });
};

export default {
  generateMFASecret,
  verifyMFA,
  generateMFAToken
};
