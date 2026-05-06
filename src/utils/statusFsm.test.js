import {
  ASSET_STATUS,
  ASSET_STATUS_LIST,
  STATUS_TRANSITIONS,
  TERMINAL_STATUSES,
} from '../constants';
import { canTransition, getAllowedTransitions, isTerminal } from './statusFsm';

describe('statusFsm', () => {
  describe('getAllowedTransitions', () => {
    test.each(ASSET_STATUS_LIST)('returns the configured targets for %s', (status) => {
      expect(getAllowedTransitions(status)).toEqual(STATUS_TRANSITIONS[status]);
    });

    it('returns [] for terminal statuses', () => {
      TERMINAL_STATUSES.forEach((status) => {
        expect(getAllowedTransitions(status)).toEqual([]);
      });
    });

    it('returns [] for unknown / falsy statuses', () => {
      expect(getAllowedTransitions(undefined)).toEqual([]);
      expect(getAllowedTransitions(null)).toEqual([]);
      expect(getAllowedTransitions('NOT_A_STATUS')).toEqual([]);
    });
  });

  describe('canTransition', () => {
    it('allows every transition declared in STATUS_TRANSITIONS', () => {
      Object.entries(STATUS_TRANSITIONS).forEach(([from, targets]) => {
        targets.forEach((to) => {
          expect(canTransition(from, to)).toBe(true);
        });
      });
    });

    it('rejects transitions out of terminal statuses', () => {
      TERMINAL_STATUSES.forEach((from) => {
        ASSET_STATUS_LIST.forEach((to) => {
          expect(canTransition(from, to)).toBe(false);
        });
      });
    });

    it('rejects self-transitions (FSM has no identity edges)', () => {
      ASSET_STATUS_LIST.forEach((s) => {
        expect(canTransition(s, s)).toBe(false);
      });
    });

    it('rejects transitions when either side is missing', () => {
      expect(canTransition(undefined, ASSET_STATUS.NEW)).toBe(false);
      expect(canTransition(ASSET_STATUS.NEW, undefined)).toBe(false);
      expect(canTransition(null, null)).toBe(false);
    });
  });

  describe('isTerminal', () => {
    it.each(TERMINAL_STATUSES)('returns true for %s', (status) => {
      expect(isTerminal(status)).toBe(true);
    });

    it('returns false for non-terminal statuses', () => {
      ASSET_STATUS_LIST.filter((s) => !TERMINAL_STATUSES.includes(s)).forEach((s) => {
        expect(isTerminal(s)).toBe(false);
      });
    });

    it('returns false for unknown / falsy statuses', () => {
      expect(isTerminal(undefined)).toBe(false);
      expect(isTerminal(null)).toBe(false);
      expect(isTerminal('NOT_A_STATUS')).toBe(false);
    });
  });
});
