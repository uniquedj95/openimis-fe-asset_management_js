import { STATUS_TRANSITIONS, TERMINAL_STATUSES } from '../constants';

/**
 * Returns the list of statuses an asset can transition to from `status`.
 * Unknown statuses yield an empty list.
 */
export const getAllowedTransitions = (status) => {
  if (!status) return [];
  return STATUS_TRANSITIONS[status] || [];
};

/**
 * Returns true when transitioning from `from` to `to` is allowed by the FSM.
 */
export const canTransition = (from, to) => {
  if (!from || !to) return false;
  return getAllowedTransitions(from).includes(to);
};

/**
 * Returns true when `status` is a terminal state (no outgoing transitions).
 */
export const isTerminal = (status) => TERMINAL_STATUSES.includes(status);
