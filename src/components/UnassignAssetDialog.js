import React, { useEffect, useState } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
} from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';

import {
  formatMessage,
  formatMessageWithValues,
  TextInput,
  journalize,
} from '@openimis/fe-core';

import { unassignAsset } from '../actions';
import { MODULE_NAME } from '../constants';
import { defaultDialogStyles } from '../util/styles';
import { assetLabel, assetUuid } from '../utils/asset';

/**
 * UnassignAssetDialog
 *
 * Simple confirmation modal with an optional notes field. On submit it
 * dispatches `unassignAsset(assetUuid, notes)`.
 */
function UnassignAssetDialog({
  intl,
  classes,
  asset,
  unassignAsset,
  journalize: journalizeAction,
  submittingMutation,
  mutation,
  onClose,
}) {
  const open = !!asset;
  const [notes, setNotes] = useState('');
  const prevSubmittingRef = React.useRef();

  useEffect(() => {
    if (open) setNotes('');
  }, [asset?.id]);

  // Journalize after mutation completes
  useEffect(() => {
    if (prevSubmittingRef.current && !submittingMutation && mutation) {
      journalizeAction(mutation);
      onClose?.();
    }
    prevSubmittingRef.current = submittingMutation;
  }, [submittingMutation, mutation, journalizeAction, onClose]);

  const handleClose = () => onClose?.();

  const handleSubmit = () => {
    unassignAsset(
      assetUuid(asset),
      notes,
      formatMessageWithValues(intl, MODULE_NAME, 'asset.unassign.mutationLabel', {
        serialNumber: assetLabel(asset),
      }),
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {asset && formatMessageWithValues(intl, MODULE_NAME, 'unassignDialog.title', {
          serialNumber: assetLabel(asset),
          name: asset.name,
        })}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {formatMessage(intl, MODULE_NAME, 'unassignDialog.message')}
        </DialogContentText>
        <Grid container className={classes.item}>
          <Grid item xs={12} className={classes.item}>
            <TextInput
              module={MODULE_NAME}
              label="unassignDialog.notes"
              value={notes}
              onChange={setNotes}
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          {formatMessage(intl, MODULE_NAME, 'unassignDialog.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
        >
          {formatMessage(intl, MODULE_NAME, 'unassignDialog.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const mapStateToProps = (state) => ({
  submittingMutation: state.assetManagement.submittingMutation,
  mutation: state.assetManagement.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ unassignAsset, journalize }, dispatch);

export default injectIntl(
  withTheme(
    withStyles(defaultDialogStyles)(
      connect(mapStateToProps, mapDispatchToProps)(UnassignAssetDialog),
    ),
  ),
);
