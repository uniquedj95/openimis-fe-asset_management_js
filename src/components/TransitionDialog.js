import React, { useEffect, useState } from 'react';
import { injectIntl } from 'react-intl';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';

import {
  formatMessage,
  formatMessageWithValues,
  TextInput,
} from '@openimis/fe-core';

import { MODULE_NAME } from '../constants';
import { defaultDialogStyles } from '../util/styles';
import { assetLabel } from '../utils/asset';

/**
 * TransitionDialog
 *
 * Modal for asset status transitions. Notes are mandatory for terminal
 * transitions (Retire / Mark Lost) for auditing purposes, and optional
 * for non-terminal transitions (Maintenance / Return to Stock).
 *
 * Props:
 *   - open: boolean - controls dialog visibility
 *   - onClose: () => void - called when user cancels or after success
 *   - onConfirm: (notes: string) => void - called when user confirms with notes
 *   - titleKey: string - translation key for dialog title
 *   - asset: object - the target asset (for labels)
 *   - submittingMutation: boolean - disables submit while mutation is in flight
 *   - isTerminal: boolean - if true, notes are mandatory; if false, notes are optional
 */
function TransitionDialog({
  intl,
  classes,
  open,
  onClose,
  onConfirm,
  titleKey,
  asset,
  submittingMutation,
  isTerminal = false,
}) {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      setNotes('');
    }
  }, [open]);

  const handleClose = () => {
    if (!submittingMutation) {
      onClose?.();
    }
  };

  const handleSubmit = () => {
    if (!submittingMutation) {
      // For non-terminal transitions, allow empty notes
      if (!isTerminal || notes.trim()) {
        onConfirm?.(notes);
      }
    }
  };

  const canSubmit = (!isTerminal || notes.trim().length > 0) && !submittingMutation;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      classes={{ paper: classes.dialog }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {formatMessageWithValues(intl, MODULE_NAME, titleKey, {
          serialNumber: assetLabel(asset),
        })}
      </DialogTitle>
      <DialogContent className={classes.content}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextInput
              module={MODULE_NAME}
              label="dialog.transition.notes.label"
              value={notes}
              onChange={setNotes}
              required={isTerminal}
              multiline
              rows={4}
              readOnly={submittingMutation}
            />
          </Grid>
          {isTerminal && !canSubmit && notes.length === 0 && (
            <Grid item xs={12}>
              <span className={classes.error}>
                {formatMessage(intl, MODULE_NAME, 'dialog.transition.notes.required')}
              </span>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submittingMutation}>
          {formatMessage(intl, MODULE_NAME, 'dialog.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={!canSubmit}
          autoFocus
        >
          {formatMessage(intl, MODULE_NAME, 'dialog.transition.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const styles = (theme) => ({
  ...defaultDialogStyles(theme),
  error: {
    color: theme.palette.error.main,
    fontSize: '0.875rem',
  },
});

export default injectIntl(withTheme(withStyles(styles)(TransitionDialog)));
