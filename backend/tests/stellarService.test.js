// Feature: stellar-give, Property 1: Campaign wallet address validation
// Validates: Requirements 1.2, 1.4

const fc = require('fast-check');
const { Keypair, StrKey } = require('stellar-sdk');

process.env.HORIZON_URL = 'https://horizon-testnet.stellar.org';

const { isValidStellarAddress } = require('../../blockchain/stellarService');

describe('isValidStellarAddress (Property 1)', () => {
  test('rejects arbitrary strings that are not valid Stellar public keys', () => {
    fc.assert(
      fc.property(fc.string(), (str) => {
        // Skip any string that happens to be a valid key (astronomically unlikely)
        if (StrKey.isValidEd25519PublicKey(str)) return true;
        // Non-56-char or non-G-prefix strings must be rejected
        if (str.length !== 56 || !str.startsWith('G')) {
          expect(isValidStellarAddress(str)).toBe(false);
        }
        return true;
      }),
      { numRuns: 100 }
    );
  });

  test('accepts all valid Stellar public keys generated from keypairs', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const keypair = Keypair.random();
        expect(isValidStellarAddress(keypair.publicKey())).toBe(true);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  test('rejects null, undefined, and empty string', () => {
    expect(isValidStellarAddress(null)).toBe(false);
    expect(isValidStellarAddress(undefined)).toBe(false);
    expect(isValidStellarAddress('')).toBe(false);
  });

  test('rejects secret keys (S-prefixed)', () => {
    const keypair = Keypair.random();
    expect(isValidStellarAddress(keypair.secret())).toBe(false);
  });
});
