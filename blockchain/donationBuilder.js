require('dotenv').config();
const {
  TransactionBuilder,
  Operation,
  Networks,
  BASE_FEE,
} = require('stellar-sdk');
const { server, getAsset } = require('./stellarService');

const NETWORK_PASSPHRASE =
  process.env.STELLAR_NETWORK === 'mainnet'
    ? Networks.PUBLIC
    : Networks.TESTNET;

/**
 * Validates donation input before building a transaction.
 * Requirements: 4.5, 4.6
 *
 * @param {object} params
 * @param {number|string} params.amount - Donation amount
 * @param {string} params.balance - Current wallet balance as string
 * @returns {{ valid: boolean, error: string|null }}
 */
function validateDonationInput({ amount, balance }) {
  const amt = Number(amount);
  if (isNaN(amt) || amt <= 0) {
    return { valid: false, error: 'Donation amount must be a positive number' };
  }
  if (Number(balance) < amt) {
    return { valid: false, error: 'Insufficient balance for this donation' };
  }
  return { valid: true, error: null };
}

/**
 * Builds an unsigned Stellar payment transaction XDR for a donation.
 * The returned XDR is intended to be signed client-side via Freighter.
 * Requirements: 4.1, 4.2
 *
 * @param {object} params
 * @param {string} params.fromWallet - Donor's Stellar public key
 * @param {string} params.toWallet - Campaign wallet (destination)
 * @param {string} params.amount - Amount to donate e.g. "10"
 * @param {string} params.assetCode - 'XLM' or token code
 * @param {string|null} params.assetIssuer - null for XLM, issuer public key for tokens
 * @returns {Promise<string>} Unsigned transaction XDR string
 */
async function buildDonationXDR({ fromWallet, toWallet, amount, assetCode, assetIssuer }) {
  const account = await server.loadAccount(fromWallet);
  const asset = getAsset(assetCode, assetIssuer);

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination: toWallet,
        asset,
        amount: String(amount),
      })
    )
    .addMemo({ type: 'text', value: 'StellarGive donation' })
    .setTimeout(180)
    .build();

  return transaction.toXDR();
}

module.exports = { validateDonationInput, buildDonationXDR };
