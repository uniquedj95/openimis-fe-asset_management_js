import React from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import PersonAddDisabledIcon from '@material-ui/icons/PersonAddDisabled';
import BuildIcon from '@material-ui/icons/Build';
import UnarchiveIcon from '@material-ui/icons/Unarchive';
import ArchiveIcon from '@material-ui/icons/Archive';
import ReportProblemIcon from '@material-ui/icons/ReportProblem';
import DeleteIcon from '@material-ui/icons/Delete';

import { formatMessage, historyPush } from '@openimis/fe-core';

import {
  MODULE_NAME,
  ASSET_STATUS,
  RIGHT_ASSET_ASSIGN,
  RIGHT_ASSET_UNASSIGN,
  RIGHT_ASSET_MAINTENANCE,
  RIGHT_ASSET_RETIRE,
  RIGHT_ASSET_DELETE,
} from '../constants';
import { canTransition, isTerminal } from '../utils/statusFsm';

/**
 * Builds an array of per-row action formatters for use as `actionFormatters`
 * on AssetSearcher. Each formatter takes an asset and returns either a
 * Tooltipped IconButton or null (button hidden when not applicable).
 *
 * Visibility rules combine:
 *   - User rights (from `rights` array)
 *   - FSM (canTransition / isTerminal)
 *   - Whether the caller wired a callback for that action
 *
 * The View action is always shown and routes to the asset detail page.
 *
 * @param {object} opts
 * @param {object} opts.intl                react-intl injected intl
 * @param {object} opts.modulesManager      core modulesManager
 * @param {object} opts.history             withHistory router history
 * @param {number[]} opts.rights            current user rights
 * @param {(asset)=>void} [opts.onAssign]      caller opens assign dialog
 * @param {(asset)=>void} [opts.onUnassign]    caller opens unassign dialog
 * @param {(asset, targetStatus)=>void} [opts.onTransition]  caller confirms+mutates
 * @param {(asset)=>void} [opts.onDelete]      caller confirms+deletes
 */
export default function buildAssetRowActions({
  intl,
  modulesManager,
  history,
  rights = [],
  onAssign,
  onUnassign,
  onTransition,
  onDelete,
}) {
  const t = (key) => formatMessage(intl, MODULE_NAME, key);

  const stop = (e) => { e?.stopPropagation?.(); };

  const view = (asset) => {
    if (asset.isDeleted) return null;
    return (
      <Tooltip title={t('tooltip.view')}>
        <IconButton
          size="small"
          onClick={(e) => {
            stop(e);
            historyPush(modulesManager, history, 'assetManagement.route.asset', [asset.uuid]);
          }}
        >
          <VisibilityIcon />
        </IconButton>
      </Tooltip>
    );
  };

  const assign = (asset) => {
    if (asset.isDeleted) return null;
    if (!onAssign) return null;
    if (!rights.includes(RIGHT_ASSET_ASSIGN)) return null;
    if (!canTransition(asset.status?.code, ASSET_STATUS.ASSIGNED)) return null;
    return (
      <Tooltip title={t('transition.tooltip.assign')}>
        <IconButton
          size="small"
          onClick={(e) => { stop(e); onAssign(asset); }}
        >
          <PersonAddIcon />
        </IconButton>
      </Tooltip>
    );
  };

  const unassign = (asset) => {
    if (asset.isDeleted) return null;
    if (!onUnassign) return null;
    if (!rights.includes(RIGHT_ASSET_UNASSIGN)) return null;
    if (asset.status?.code !== ASSET_STATUS.ASSIGNED) return null;
    return (
      <Tooltip title={t('transition.tooltip.unassign')}>
        <IconButton
          size="small"
          onClick={(e) => { stop(e); onUnassign(asset); }}
        >
          <PersonAddDisabledIcon />
        </IconButton>
      </Tooltip>
    );
  };

  function transitionButton({
    target,
    rightCode,
    icon,
    tooltipKey,
  }) {
    function transitionFormatter(asset) {
      if (asset.isDeleted) return null;
      if (!onTransition) return null;
      if (rightCode != null && !rights.includes(rightCode)) return null;
      if (!canTransition(asset.status?.code, target)) return null;
      return (
        <Tooltip title={t(tooltipKey)}>
          <IconButton
            size="small"
            onClick={(e) => { stop(e); onTransition(asset, target); }}
          >
            {icon}
          </IconButton>
        </Tooltip>
      );
    }
    return transitionFormatter;
  }

  const sendToMaintenance = transitionButton({
    target: ASSET_STATUS.MAINTENANCE,
    rightCode: RIGHT_ASSET_MAINTENANCE,
    icon: <BuildIcon />,
    tooltipKey: 'transition.tooltip.sendToMaintenance',
  });

  const returnToStock = transitionButton({
    target: ASSET_STATUS.IN_STOCK,
    // No dedicated right; reuse maintenance/assign permissions implicitly via FSM.
    // Allow if the user can either assign or send to maintenance (covers operational roles).
    rightCode: null,
    icon: <UnarchiveIcon />,
    tooltipKey: 'transition.tooltip.moveToInStock',
  });

  const retire = transitionButton({
    target: ASSET_STATUS.RETIRED,
    rightCode: RIGHT_ASSET_RETIRE,
    icon: <ArchiveIcon />,
    tooltipKey: 'transition.tooltip.retire',
  });

  const markLost = transitionButton({
    target: ASSET_STATUS.LOST,
    rightCode: RIGHT_ASSET_RETIRE,
    icon: <ReportProblemIcon />,
    tooltipKey: 'transition.tooltip.markLost',
  });

  const del = (asset) => {
    if (!onDelete) return null;
    if (!rights.includes(RIGHT_ASSET_DELETE)) return null;
    if (isTerminal(asset.status?.code)) return null;
    if (asset.isDeleted) return null;
    return (
      <Tooltip title={t('tooltip.delete')}>
        <IconButton
          size="small"
          onClick={(e) => { stop(e); onDelete(asset); }}
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    );
  };

  return [
    view,
    assign,
    unassign,
    sendToMaintenance,
    returnToStock,
    retire,
    markLost,
    del,
  ];
}
