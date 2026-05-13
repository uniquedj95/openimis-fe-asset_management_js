import React, { useEffect, useRef, useState } from 'react';
import { Button, Tooltip } from '@material-ui/core';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withTheme, withStyles } from '@material-ui/core/styles';

import BuildIcon from '@material-ui/icons/Build';
import ArchiveIcon from '@material-ui/icons/Archive';
import DeleteIcon from '@material-ui/icons/Delete';

import {
  FormattedMessage,
  formatMessage,
  formatMessageWithValues,
  coreConfirm,
  clearConfirm,
  journalize,
  withHistory,
  withModulesManager,
  historyPush,
} from '@openimis/fe-core';

import {
  MODULE_NAME,
  ASSET_STATUS,
  RIGHT_ASSET_DELETE,
  RIGHT_ASSET_MAINTENANCE,
  RIGHT_ASSET_RETIRE,
} from '../constants';
import { canTransition, isTerminal } from '../utils/statusFsm';
import {
  deleteAsset, transitionAssetStatus,
} from '../actions';
import { assetUuid, assetLabel } from '../utils/asset';

const styles = (theme) => ({
  bar: {
    ...theme.paper.body,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing ? theme.spacing(1) : 8,
    padding: 8,
  },
});

/**
 * AssetPage action bar
 *
 * Renders the operational buttons for the detail page.
 * Buttons drive `coreConfirm` for transitions and dispatch
 * mutations through redux actions; the page reacts to the mutation lifecycle
 * via `submittingMutation`.
 */
function AssetActionBar({
  intl, classes, history, modulesManager, edited, rights,
  confirmed, coreConfirm, clearConfirm, journalize,
  submittingMutation, mutation,
  deleteAsset, transitionAssetStatus,
}) {
  const [pending, setPending] = useState(null);
  const prevSubmittingRef = useRef();

  const currentStatus = edited?.status?.code;
  const terminal = isTerminal(currentStatus);

  const canMaintenance = !terminal
    && rights?.includes(RIGHT_ASSET_MAINTENANCE)
    && canTransition(currentStatus, ASSET_STATUS.REPAIR);
  const canRetire = !terminal
    && rights?.includes(RIGHT_ASSET_RETIRE)
    && canTransition(currentStatus, ASSET_STATUS.RETIRED);
  const canDelete = !terminal && rights?.includes(RIGHT_ASSET_DELETE);

  const openConfirm = () => {
    if (pending?.kind === 'delete') {
      coreConfirm(
        formatMessageWithValues(intl, MODULE_NAME, 'asset.delete.confirm.title', {
          serialNumber: assetLabel(edited),
          name: edited?.name ?? '',
        }),
        formatMessage(intl, MODULE_NAME, 'asset.delete.confirm.message'),
      );
    } else if (pending?.kind === 'transition') {
      const statusLabel = formatMessage(intl, MODULE_NAME, `asset.status.${pending.target}`);
      coreConfirm(
        formatMessageWithValues(intl, MODULE_NAME, 'asset.transition.confirm.title', {
          status: statusLabel,
        }),
        formatMessageWithValues(intl, MODULE_NAME, 'asset.transition.confirm.message', {
          serialNumber: assetLabel(edited),
          name: edited?.name ?? '',
          status: statusLabel,
        }),
      );
    }
  };

  useEffect(() => {
    if (pending) openConfirm();
  }, [pending]);

  useEffect(() => {
    if (!pending) return undefined;
    if (confirmed) {
      if (pending.kind === 'delete') {
        deleteAsset(
          edited,
          formatMessageWithValues(intl, MODULE_NAME, 'asset.delete.mutationLabel', {
            serialNumber: assetLabel(edited),
          }),
        );
      } else if (pending.kind === 'transition') {
        const statusLabel = formatMessage(intl, MODULE_NAME, `asset.status.${pending.target}`);
        transitionAssetStatus(
          assetUuid(edited),
          pending.target,
          null,
          formatMessageWithValues(intl, MODULE_NAME, 'asset.transition.mutationLabel', {
            serialNumber: assetLabel(edited),
            status: statusLabel,
          }),
        );
      }
    }
    if (confirmed !== null) setPending(null);
    return () => confirmed && clearConfirm(false);
  }, [confirmed]);

  // Journalize once a mutation completes; redirect back to the list after a
  // successful delete.
  useEffect(() => {
    if (prevSubmittingRef.current && !submittingMutation) {
      journalize(mutation);
      if (mutation?.actionType === 'ASSET_MGMT_DELETE_ASSET' && !mutation?.error) {
        historyPush(modulesManager, history, 'assetManagement.route.assets');
      }
    }
  }, [submittingMutation]);

  useEffect(() => { prevSubmittingRef.current = submittingMutation; });

  if (!edited) return null;

  return (
    <div className={classes.bar}>
      {canMaintenance && (
        <Tooltip title={formatMessage(intl, MODULE_NAME, 'transition.tooltip.sendToMaintenance')}>
          <Button
            color="primary"
            variant="outlined"
            startIcon={<BuildIcon />}
            onClick={() => setPending({ kind: 'transition', target: ASSET_STATUS.REPAIR })}
            disabled={submittingMutation}
          >
            <FormattedMessage module={MODULE_NAME} id="transition.sendToMaintenance" />
          </Button>
        </Tooltip>
      )}
      {canRetire && (
        <Tooltip title={formatMessage(intl, MODULE_NAME, 'transition.tooltip.retire')}>
          <Button
            color="primary"
            variant="outlined"
            startIcon={<ArchiveIcon />}
            onClick={() => setPending({ kind: 'transition', target: ASSET_STATUS.RETIRED })}
            disabled={submittingMutation}
          >
            <FormattedMessage module={MODULE_NAME} id="transition.retire" />
          </Button>
        </Tooltip>
      )}
      {canDelete && (
        <Tooltip title={formatMessage(intl, MODULE_NAME, 'tooltip.delete')}>
          <Button
            color="secondary"
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={() => setPending({ kind: 'delete' })}
            disabled={submittingMutation}
          >
            <FormattedMessage module={MODULE_NAME} id="button.delete" />
          </Button>
        </Tooltip>
      )}
    </div>
  );
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  confirmed: state.core?.confirmed,
  submittingMutation: state.assetManagement.submittingMutation,
  mutation: state.assetManagement.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  deleteAsset,
  transitionAssetStatus,
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

export default injectIntl(
  withHistory(
    withModulesManager(
      withTheme(
        withStyles(styles)(
          connect(mapStateToProps, mapDispatchToProps)(AssetActionBar),
        ),
      ),
    ),
  ),
);
