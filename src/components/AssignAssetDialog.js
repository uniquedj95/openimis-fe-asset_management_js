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
  formatMessage,
  formatMessageWithValues,
  PublishedComponent,
  TextInput,
  useModulesManager,
} from '@openimis/fe-core';

import { assignAsset } from '../actions';
import { MODULE_NAME, RIGHT_ASSET_ASSIGN } from '../constants';
import { defaultDialogStyles } from '../util/styles';
import { assetLabel, assetUuid } from '../utils/asset';

/**
 * AssignAssetDialog
 *
 * Modal that captures the user to assign an asset to, optional notes, and an
 * optional "force reassign" flag (visible only when the asset already has an
 * assignee AND the current user has RIGHT_ASSET_ASSIGN). On submit it
 * dispatches `assignAsset(assetUuid, userUuid, notes, force)` with a
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
  onClose,
}) {
  const modulesManager = useModulesManager();
  const open = !!asset;
  const isReassign = !!asset?.assignedTo;
  const canForce = isReassign && rights?.includes(RIGHT_ASSET_ASSIGN);

  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState('');
  const [force, setForce] = useState(false);

  useEffect(() => {
    if (open) {
      setUser(null);
      setNotes('');
      setForce(false);
    }
  }, [asset?.id]);

  const handleClose = () => {
    onClose?.();
  };

  const handleSubmit = () => {
    if (!user?.uuid && !user?.id) return;
    assignAsset(
      assetUuid(asset),
      user.uuid || user.id,
      notes,
      force,
      formatMessageWithValues(intl, MODULE_NAME, 'asset.assign.mutationLabel', {
        serialNumber: assetLabel(asset),
      }),
    );
    handleClose();
  };

  const titleKey = isReassign ? 'assignDialog.reassignTitle' : 'assignDialog.title';

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {asset && formatMessageWithValues(intl, MODULE_NAME, titleKey, {
          serialNumber: assetLabel(asset),
          name: asset.name,
        })}
      </DialogTitle>
      <DialogContent>
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
          disabled={!user?.uuid && !user?.id}
        >
          {formatMessage(intl, MODULE_NAME, 'assignDialog.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ assignAsset }, dispatch);

export default injectIntl(
  withTheme(
    withStyles(defaultDialogStyles)(
      connect(mapStateToProps, mapDispatchToProps)(AssignAssetDialog),
    ),
  ),
);
