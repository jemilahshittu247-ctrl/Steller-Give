require('dotenv').config();
const { Horizon, Asset, StrKey } = require('stellar-sdk');

// Shared Horizon server instance
const server = new Horizon.Server(
  process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org'
);

/**
 * Validates that a string is a valid Stellar public key.
 * Must be a 56-character G-prefixed Ed25519 public key.
 * Requirements: 1.2, 1.4
 *
 * @param {string} address
 * @returns {boolean}
 */
function isValidStellarAddress(address) {
  if (typeof address !== 'string') return false;
  try {
    return StrKey.isValidEd25519PublicKey(address);
  } catch {
    return false;
  }
}

/**
 * Queries Horizon for the account's native XLM balance.
 * Returns '0' if the account does not exist on the network.
 * Requirements: 3.4
 *
 * @param {string} walletAddress - Stellar public key
 * @returns {Promise<string>} XLM balance as a string e.g. "100.0000000"
 */
async function getXLMBalance(walletAddress) {
  try {
    const account = await server.loadAccount(walletAddress);
    const native = account.balances.find((b) => b.asset_type === 'native');
    return native ? native.balance : '0';
  } catch (err) {
    if (err.response && err.response.status === 404) return '0';
    throw err;
  }
}

/**
 * Returns an Asset object for the given asset code and issuer.
 * Pass assetCode='XLM' and no issuer for native XLM.
 *
 * @param {string} assetCode
 * @param {string|null} assetIssuer
 * @returns {Asset}
 */
function getAsset(assetCode, assetIssuer) {
  if (assetCode === 'XLM' || !assetIssuer) return Asset.native();
  return new Asset(assetCode, assetIssuer);
}

module.exports = { server, isValidStellarAddress, getXLMBalance, getAsset };
