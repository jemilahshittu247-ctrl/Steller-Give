// Feature: stellar-give, Property 6: Donation input validation
// Validates: Requirements 4.5, 4.6

const fc = require('fast-check');
const { validateDonationInput } = require('../../blockchain/donationBuilder');

describe('validateDonationInput (Property 6)', () => {
  // Non-positive amounts must always be rejected
  test('rejects non-positive donation amounts', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(0),
          fc.integer({ max: -1 }),
          fc.constant(-0.001),
          fc.constant(NaN),
        ),
        fc.integer({ min: 1, max: 10000 }).map(String),
        (amount, balance) => {
          const { valid, error } = validateDonationInput({ amount, balance });
          expect(valid).toBe(false);
          expect(error).toBeTruthy();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Insufficient balance must always be rejected
  test('rejects when balance is less than donation amount', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        (amount) => {
          // balance is always strictly less than amount
          const balance = String(amount - 0.5);
          const { valid, error } = validateDonationInput({ amount, balance });
          expect(valid).toBe(false);
          expect(error).toMatch(/insufficient/i);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Valid inputs (positive amount, sufficient balance) must always pass
  test('accepts valid donation inputs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 500 }),
        (amount) => {
          const balance = String(amount + 10); // always enough
          const { valid, error } = validateDonationInput({ amount, balance });
          expect(valid).toBe(true);
          expect(error).toBeNull();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('rejects string "0" as amount', () => {
    const { valid } = validateDonationInput({ amount: '0', balance: '100' });
    expect(valid).toBe(false);
  });
});
