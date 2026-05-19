import React, { useState } from 'react';
import clsx from 'clsx';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ReplayIcon from '@material-ui/icons/Replay';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import PersonAddDisabledIcon from '@material-ui/icons/PersonAddDisabled';
import BuildIcon from '@material-ui/icons/Build';
import ArchiveIcon from '@material-ui/icons/Archive';
import DeleteIcon from '@material-ui/icons/Delete';
import { makeStyles } from '@material-ui/styles';

import {
  Form, ProgressOrError,
  FormattedMessage, formatMessage,
  coreConfirm, clearConfirm, journalize,
} from '@openimis/fe-core';

import {
  MODULE_NAME,
  ASSET_STATUS,
  RIGHT_ASSET_DELETE,
  RIGHT_ASSET_MAINTENANCE,
  RIGHT_ASSET_RETIRE,
  RIGHT_ASSET_ASSIGN,
  RIGHT_ASSET_UNASSIGN,
} from '../constants';
import { canTransition, isTerminal } from '../utils/statusFsm';
import { deleteAsset, transitionAssetStatus } from '../actions';
import useAssetActions from '../hooks/useAssetActions';
import AssetMasterPanel from './AssetMasterPanel';
import AssetAssignmentPanel from './AssetAssignmentPanel';
import AssignAssetDialog from './AssignAssetDialog';
import UnassignAssetDialog from './UnassignAssetDialog';
import TransitionDialog from './TransitionDialog';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  locked: theme.page?.locked,
}));

/**
 * AssetForm — composes the detail panels under the openIMIS `Form`
 * helper. Save / Cancel / Reset are owned by the `Form` helper; status
 * transition and delete buttons are integrated as form actions.
 */
function AssetForm({
  intl, edited, asset, readOnly, error, fetchingAsset,
  onChange, onSave, onBack, onReset, canSave,
  rights, confirmed, coreConfirm, clearConfirm, journalize,
  submittingMutation, mutation,
  deleteAsset, transitionAssetStatus,
}) {
  const classes = useStyles();
  const isEdit = !!asset?.uuid;
  const titleKey = isEdit ? 'assetPage.title.edit' : 'assetPage.title.create';

  const [openAssign, setOpenAssign] = useState(false);
  const [openUnassign, setOpenUnassign] = useState(false);

  const currentStatus = edited?.status?.code;
  const terminal = isTerminal(currentStatus);
  const assignee = edited?.assignedTo;

  const canMaintenance = isEdit && !terminal
    && rights?.includes(RIGHT_ASSET_MAINTENANCE)
    && canTransition(currentStatus, ASSET_STATUS.REPAIR);
  const canRetire = isEdit && !terminal
    && rights?.includes(RIGHT_ASSET_RETIRE)
    && canTransition(currentStatus, ASSET_STATUS.RETIRED);
  const canDelete = isEdit && !terminal && rights?.includes(RIGHT_ASSET_DELETE);
  const canAssign = isEdit && !terminal && rights?.includes(RIGHT_ASSET_ASSIGN);
  const canUnassign = isEdit && !terminal && !!assignee && rights?.includes(RIGHT_ASSET_UNASSIGN);

  const {
    openDeleteConfirm,
    openTransitionConfirm,
    pendingTransition,
    isTerminalTransition,
    handleTransitionConfirm,
    closeTransitionDialog,
  } = useAssetActions({
    intl,
    coreConfirm,
    clearConfirm,
    journalize,
    onDeleteAsset: (asset) => {
      deleteAsset(
        asset,
        formatMessage(intl, MODULE_NAME, 'asset.delete.mutationLabel'),
      );
    },
    onTransition: (asset, target, notes) => {
      const statusLabel = formatMessage(intl, MODULE_NAME, `asset.status.${target}`);
      transitionAssetStatus(
        asset.uuid,
        target,
        notes,
        formatMessage(intl, MODULE_NAME, 'asset.transition.mutationLabel', {
          status: statusLabel,
        }),
      );
    },
    confirmed,
    submittingMutation,
    mutation,
  });

  const formActions = [
    { doIt: onReset, icon: <ReplayIcon />, onlyIfDirty: !readOnly },
  ];

  if (canMaintenance) {
    formActions.push({
      doIt: () => openTransitionConfirm(edited, ASSET_STATUS.REPAIR),
      icon: <BuildIcon />,
      tooltip: formatMessage(intl, MODULE_NAME, 'transition.tooltip.sendToMaintenance'),
      label: <FormattedMessage module={MODULE_NAME} id="transition.sendToMaintenance" />,
      disabled: submittingMutation,
    });
  }

  if (canRetire) {
    formActions.push({
      doIt: () => openTransitionConfirm(edited, ASSET_STATUS.RETIRED),
      icon: <ArchiveIcon />,
      tooltip: formatMessage(intl, MODULE_NAME, 'transition.tooltip.retire'),
      label: <FormattedMessage module={MODULE_NAME} id="transition.retire" />,
      disabled: submittingMutation,
    });
  }

  if (canAssign) {
    formActions.push({
      doIt: () => setOpenAssign(true),
      icon: <PersonAddIcon />,
      tooltip: formatMessage(intl, MODULE_NAME, 'transition.tooltip.assign'),
      label: <FormattedMessage module={MODULE_NAME} id="transition.assign" />,
      disabled: submittingMutation,
    });
  }

  if (canUnassign) {
    formActions.push({
      doIt: () => setOpenUnassign(true),
      icon: <PersonAddDisabledIcon />,
      tooltip: formatMessage(intl, MODULE_NAME, 'transition.tooltip.unassign'),
      label: <FormattedMessage module={MODULE_NAME} id="transition.unassign" />,
      disabled: submittingMutation,
    });
  }

  if (canDelete) {
    formActions.push({
      doIt: () => openDeleteConfirm(edited),
      icon: <DeleteIcon />,
      tooltip: formatMessage(intl, MODULE_NAME, 'tooltip.delete'),
      label: <FormattedMessage module={MODULE_NAME} id="button.delete" />,
      disabled: submittingMutation,
    });
  }

  return (
    <div className={clsx(classes.page, readOnly && classes.locked)}>
      <ProgressOrError progress={fetchingAsset} error={error} />
      <Form
        module={MODULE_NAME}
        title={titleKey}
        titleParams={{
          serialNumber: edited?.serialNumber ?? asset?.serialNumber ?? '',
          name: edited?.name ?? asset?.name ?? '',
        }}
        readOnly={readOnly}
        edited={edited}
        edited_id={edited?.uuid}
        canSave={canSave}
        onEditedChanged={onChange}
        HeadPanel={AssetMasterPanel}
        Panels={[
          ...(isEdit ? [AssetAssignmentPanel] : []),
        ]}
        save={onSave}
        back={onBack}
        openDirty={onSave}
        actions={formActions}
      />

      <AssignAssetDialog
        asset={openAssign ? edited : null}
        onClose={() => setOpenAssign(false)}
      />
      <UnassignAssetDialog
        asset={openUnassign ? edited : null}
        onClose={() => setOpenUnassign(false)}
      />
      <TransitionDialog
        open={!!pendingTransition}
        onClose={closeTransitionDialog}
        onConfirm={handleTransitionConfirm}
        titleKey={`dialog.transition.${pendingTransition?.target}.title`}
        asset={pendingTransition?.asset}
        submittingMutation={submittingMutation}
        isTerminal={pendingTransition?.target ? isTerminalTransition(pendingTransition.target) : false}
      />
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
  connect(mapStateToProps, mapDispatchToProps)(AssetForm),
);
