import { PriorAuthStatus } from 'src/libs/common/constants';
import { ALLOWED, canTransition, FINAL, noteRequired } from './transitions';

const {
  DRAFT,
  SUBMITTED,
  PENDING_PAYER,
  NEEDS_INFO,
  APPROVED,
  DENIED,
  APPEALED,
  CANCELLED,
} = PriorAuthStatus;

describe('transitions', () => {
  it('defines moves for every status', () => {
    expect(Object.keys(ALLOWED).sort()).toEqual(
      Object.values(PriorAuthStatus).sort(),
    );
  });

  it.each([
    [DRAFT, SUBMITTED],
    [DRAFT, CANCELLED],
    [SUBMITTED, PENDING_PAYER],
    [SUBMITTED, APPROVED],
    [PENDING_PAYER, NEEDS_INFO],
    [PENDING_PAYER, DENIED],
    [NEEDS_INFO, SUBMITTED],
    [DENIED, APPEALED],
    [APPEALED, APPROVED],
    [APPEALED, DENIED],
  ])('allows %s -> %s', (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });

  it.each([
    [DRAFT, APPROVED],
    [DRAFT, PENDING_PAYER],
    [SUBMITTED, CANCELLED],
    [PENDING_PAYER, SUBMITTED],
    [NEEDS_INFO, APPROVED],
    [DENIED, APPROVED],
    [DENIED, SUBMITTED],
    [APPEALED, APPEALED],
    [APPROVED, DENIED],
    [CANCELLED, DRAFT],
  ])('rejects %s -> %s', (from, to) => {
    expect(canTransition(from, to)).toBe(false);
  });

  it.each(FINAL)('%s is final: no moves out', (status) => {
    expect(ALLOWED[status]).toEqual([]);
    for (const to of Object.values(PriorAuthStatus)) {
      expect(canTransition(status, to)).toBe(false);
    }
  });

  it('only APPROVED and CANCELLED are final', () => {
    const final = Object.values(PriorAuthStatus).filter(
      (status) => ALLOWED[status].length === 0,
    );
    expect(final.sort()).toEqual([...FINAL].sort());
  });

  describe('noteRequired', () => {
    it('requires a note to resubmit from NEEDS_INFO', () => {
      expect(noteRequired(NEEDS_INFO, SUBMITTED)).toBe(true);
    });

    it('requires a note to appeal', () => {
      expect(noteRequired(DENIED, APPEALED)).toBe(true);
    });

    it.each([
      [DRAFT, SUBMITTED],
      [SUBMITTED, PENDING_PAYER],
      [PENDING_PAYER, DENIED],
      [APPEALED, APPROVED],
      [DRAFT, CANCELLED],
    ])('does not require a note for %s -> %s', (from, to) => {
      expect(noteRequired(from, to)).toBe(false);
    });
  });
});
