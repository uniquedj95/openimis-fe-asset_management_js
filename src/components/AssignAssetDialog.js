import React, { useEffect, useState } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Switch,
} from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';

import {
  decodeId,
  formatMessage,
  formatMessageWithValues,
  PublishedComponent,
  TextInput,
  useModulesManager,
  journalize,
} from '@openimis/fe-core';

import { assignAsset } from '../actions';
import { MODULE_NAME, RIGHT_ASSET_ASSIGN } from '../constants';
import { defaultDialogStyles } from '../util/styles';
import { assetLabel } from '../utils/asset';

/**
 * AssignAssetDialog
 *
 * Modal that captures the user to assign an asset to, optional notes, and an
 * optional "force reassign" flag (visible only when the asset already has an
 * assignee AND the current user has RIGHT_ASSET_ASSIGN). On submit it
 * dispatches `assignAsset(asset.uuid, user.uuid, notes, force)` with a
 * localized clientMutationLabel.
 *
 * Props:
 *   - asset: the target asset (or null to keep dialog closed)
 *   - onClose: () => void, parent clears its selected asset
 */
function AssignAssetDialog({
  intl,
  classes,
  asset,
  rights,
  assignAsset,
  journalize: journalizeAction,
  submittingMutation,
  mutation,
  onClose,
}) {
  const modulesManager = useModulesManager();
  const open = !!asset;
  const isReassign = !!asset?.assignedTo;
  const canForce = isReassign && rights?.includes(RIGHT_ASSET_ASSIGN);

  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState('');
  const [force, setForce] = useState(false);
  const prevSubmittingRef = React.useRef();

  useEffect(() => {
    if (open) {
      setUser(null);
      setNotes('');
      setForce(false);
    }
  }, [asset?.uuid]);

  // Journalize after mutation completes
  useEffect(() => {
    if (prevSubmittingRef.current && !submittingMutation && mutation) {
      journalizeAction(mutation);
      onClose?.();
    }
    prevSubmittingRef.current = submittingMutation;
  }, [submittingMutation, mutation, journalizeAction, onClose]);

  const handleClose = () => {
    onClose?.();
  };

  const handleSubmit = () => {
    if (!user?.id) return;
    assignAsset(
      asset.uuid,
      decodeId(user.id),
      notes,
      force,
      formatMessageWithValues(intl, MODULE_NAME, 'asset.assign.mutationLabel', {
        serialNumber: assetLabel(asset),
      }),
    );
  };

  const titleKey = isReassign ? 'assignDialog.reassignTitle' : 'assignDialog.title';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="assign-dialog-title"
      aria-describedby="assign-dialog-content"
    >
      <DialogTitle id="assign-dialog-title">
        {asset && formatMessageWithValues(intl, MODULE_NAME, titleKey, {
          serialNumber: assetLabel(asset),
          name: asset.name,
        })}
      </DialogTitle>
      <DialogContent id="assign-dialog-content">
        <Grid container direction="column" spacing={2} className={classes.item}>
          {modulesManager.getRef('admin.UserPicker') && (
            <Grid item className={classes.item}>
              <PublishedComponent
                pubRef="admin.UserPicker"
                module={MODULE_NAME}
                label={formatMessage(intl, MODULE_NAME, 'assignDialog.user')}
                value={user}
                onChange={(u) => setUser(u)}
                required
                withNull={false}
              />
            </Grid>
          )}
          <Grid item className={classes.item}>
            <TextInput
              module={MODULE_NAME}
              label="assignDialog.notes"
              value={notes}
              onChange={setNotes}
              multiline
              rows={3}
            />
          </Grid>
          {canForce && (
            <Grid item className={classes.item}>
              <FormControlLabel
                control={(
                  <Switch
                    checked={force}
                    onChange={(e) => setForce(e.target.checked)}
                    color="primary"
                  />
                )}
                label={formatMessage(intl, MODULE_NAME, 'assignDialog.forceReassign')}
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          {formatMessage(intl, MODULE_NAME, 'assignDialog.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={!user?.id}
        >
          {formatMessage(intl, MODULE_NAME, 'assignDialog.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  submittingMutation: state.assetManagement.submittingMutation,
  mutation: state.assetManagement.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ assignAsset, journalize }, dispatch);

export default injectIntl(
  withTheme(
    withStyles(defaultDialogStyles)(
      connect(mapStateToProps, mapDispatchToProps)(AssignAssetDialog),
    ),
  ),
);
