import { useEffect, useRef, useState } from 'react';
import {
  formatMessage,
  formatMessageWithValues,
} from '@openimis/fe-core';

import { MODULE_NAME } from '../constants';

/**
 * useAssetActions
 *
 * Shared hook for managing asset deletion, transitions, and other mutations
 * with confirmation dialogs.
 *
 * @param {object} opts
 * @param {object} opts.intl            react-intl injected intl
 * @param {object} opts.coreConfirm     core confirmation action
 * @param {object} opts.clearConfirm    core clear confirmation action
 * @param {object} opts.journalize      core journalize action
 * @param {function} opts.onDeleteAsset Handler for delete mutation
 * @param {function} opts.onTransition  Handler for transition mutation
 * @param {boolean} opts.confirmed      Core confirmation state
 * @param {boolean} opts.submittingMutation  Whether mutation is in flight
 * @param {object} opts.mutation        Current mutation state
 *
 * @returns {object}
 *   - getAssetLabel(asset) - returns asset label for confirmations
 *   - openDeleteConfirm(asset) - opens delete confirmation dialog
 *   - openTransitionConfirm(asset, target) - opens transition confirmation
 *   - handleDeleteConfirm() - called when delete is confirmed
 *   - handleTransitionConfirm() - called when transition is confirmed
 */
export default function useAssetActions({
  intl,
  coreConfirm: coreConfirmAction,
  clearConfirm: clearConfirmAction,
  journalize: journalizeAction,
  onDeleteAsset,
  onTransition,
  confirmed,
  submittingMutation,
  mutation,
}) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const [pendingTransition, setPendingTransition] = useState(null); // { asset, target }
  const prevSubmittingRef = useRef();

  const getAssetLabel = (asset) => asset?.serialNumber || '';

  const openDeleteConfirm = (asset) => {
    setPendingDelete(asset);
    coreConfirmAction(
      formatMessageWithValues(intl, MODULE_NAME, 'asset.delete.confirm.title', {
        serialNumber: getAssetLabel(asset),
        name: asset?.name ?? '',
      }),
      formatMessage(intl, MODULE_NAME, 'asset.delete.confirm.message'),
    );
  };

  const openTransitionConfirm = (asset, target) => {
    setPendingTransition({ asset, target });
    const statusLabel = formatMessage(intl, MODULE_NAME, `asset.status.${target}`);
    coreConfirmAction(
      formatMessageWithValues(intl, MODULE_NAME, 'asset.transition.confirm.title', {
        status: statusLabel,
      }),
      formatMessageWithValues(intl, MODULE_NAME, 'asset.transition.confirm.message', {
        serialNumber: getAssetLabel(asset),
        name: asset?.name ?? '',
        status: statusLabel,
      }),
    );
  };

  useEffect(() => {
    if (!confirmed) return undefined;

    if (pendingDelete && onDeleteAsset) {
      onDeleteAsset(pendingDelete);
    } else if (pendingTransition && onTransition) {
      onTransition(pendingTransition.asset, pendingTransition.target);
    }

    if (confirmed !== null) {
      setPendingDelete(null);
      setPendingTransition(null);
    }

    return () => confirmed && clearConfirmAction(false);
  }, [confirmed]);

  useEffect(() => {
    if (prevSubmittingRef.current && !submittingMutation) {
      journalizeAction(mutation);
    }
  }, [submittingMutation]);

  useEffect(() => { prevSubmittingRef.current = submittingMutation; });

  return {
    getAssetLabel,
    openDeleteConfirm,
    openTransitionConfirm,
    pendingDelete,
    pendingTransition,
  };
}
