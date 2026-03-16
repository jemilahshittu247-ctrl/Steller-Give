require('dotenv').config();
const { server } = require('./stellarService');

/**
 * Formats a Horizon payment operation record into a display-friendly object.
 * Requirements: 5.2, 9.4
 *
 * @param {object} operation - Horizon payment operation record
 * @param {string} txTimestamp - ISO timestamp from the parent transaction
 * @returns {{ donorWallet, amount, assetCode, assetIssuer, timestamp }}
 */
function formatTransaction(operation, txTimestamp) {
  return {
    donorWallet: operation.from,
    amount: operation.amount,
    assetCode: operation.asset_type === 'native' ? 'XLM' : operation.asset_code,
    assetIssuer: operation.asset_type === 'native' ? null : operation.asset_issuer,
    timestamp: txTimestamp || operation.created_at,
  };
}

/**
 * Verifies a transaction hash on Horizon and checks it is a payment
 * to the specified campaign wallet.
 * Requirements: 9.1, 9.2, 9.3
 *
 * @param {string} txHash - Stellar transaction hash
 * @param {string} campaignWallet - Expected destination public key
 * @returns {Promise<{ valid: boolean, amount?: string, assetCode?: string, donor?: string, timestamp?: string, ledger?: number }>}
 */
async function verifyDonation(txHash, campaignWallet) {
  let tx;
  try {
    tx = await server.transactions().transaction(txHash).call();
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return { valid: false, error: 'Transaction not found on Stellar ledger' };
    }
    throw err;
  }

  // Fetch the operations for this transaction
  const opsPage = await server.operations().forTransaction(txHash).call();
  const paymentOp = opsPage.records.find(
    (op) => op.type === 'payment' && op.to === campaignWallet
  );

  if (!paymentOp) {
    return { valid: false, error: 'Transaction is not a payment to the campaign wallet' };
  }

  return {
    valid: true,
    amount: paymentOp.amount,
    assetCode: paymentOp.asset_type === 'native' ? 'XLM' : paymentOp.asset_code,
    assetIssuer: paymentOp.asset_type === 'native' ? null : paymentOp.asset_issuer,
    donor: paymentOp.from,
    timestamp: tx.created_at,
    ledger: tx.ledger_attr,
  };
}

/**
 * Fetches all payment operations to a campaign wallet from Horizon,
 * with optional cursor-based pagination.
 * Requirements: 5.1, 5.5
 *
 * @param {string} campaignWallet - Campaign's Stellar public key
 * @param {string|null} cursor - Horizon pagination cursor
 * @returns {Promise<{ records: object[], nextCursor: string|null }>}
 */
async function getCampaignTransactions(campaignWallet, cursor = null) {
  let builder = server
    .payments()
    .forAccount(campaignWallet)
    .limit(20)
    .order('desc');

  if (cursor) builder = builder.cursor(cursor);

  const page = await builder.call();
  const payments = page.records.filter((r) => r.type === 'payment' && r.to === campaignWallet);

  const nextCursor =
    page.records.length > 0 ? page.records[page.records.length - 1].paging_token : null;

  return {
    records: payments.map((op) => formatTransaction(op, op.created_at)),
    nextCursor,
  };
}

module.exports = { formatTransaction, verifyDonation, getCampaignTransactions };
