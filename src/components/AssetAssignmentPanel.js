import React, { useEffect, useState } from 'react';
import {
  Grid, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow,
} from '@material-ui/core';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withTheme, withStyles } from '@material-ui/core/styles';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import PersonAddDisabledIcon from '@material-ui/icons/PersonAddDisabled';

import {
  FormattedMessage,
  ProgressOrError,
  formatMessage,
  formatDateFromISO,
  withModulesManager,
} from '@openimis/fe-core';

import {
  MODULE_NAME,
  RIGHT_ASSET_ASSIGN,
  RIGHT_ASSET_UNASSIGN,
} from '../constants';
import { isTerminal } from '../utils/statusFsm';
import { fetchAssignmentHistory } from '../actions';
import { assetUuid } from '../utils/asset';
import AssignAssetDialog from './AssignAssetDialog';
import UnassignAssetDialog from './UnassignAssetDialog';

const styles = (theme) => ({
  item: theme.paper.item,
  paper: theme.paper.paper,
  title: theme.paper.title,
  emptyStateContainer: {
    minHeight: '150px',
  },
  tableHeaderRow: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
  },
  activeAssignmentRow: {
    backgroundColor: '#fafafa',
  },
  unassignButton: {
    color: theme.palette.error.main,
    borderColor: theme.palette.error.main,
  },
  buttonText: {
    textTransform: 'none',
  },
});

const INLINE_LIMIT = 5;

function formatUser(u) {
  if (!u) return '—';
  return [u.lastName, u.otherNames].filter(Boolean).join(' ') || u.username || '—';
}

/**
 * AssetAssignmentPanel
 *
 * Combines the current-assignment display (with Assign / Unassign actions)
 * and the compact assignment-history list into a single panel.
 */
function AssetAssignmentPanel({
  intl, classes, modulesManager, edited, rights,
  fetchingAssetHistory, fetchedAssetHistory, errorAssetHistory,
  assetHistory, assetHistoryTotalCount, mutationKey,
  fetchAssignmentHistory,
}) {
  const [openAssign, setOpenAssign] = useState(false);
  const [openUnassign, setOpenUnassign] = useState(false);

  const uuid = assetUuid(edited);
  const terminal = isTerminal(edited?.status?.code);
  const assignee = edited?.assignedTo;
  const canAssign = !terminal && rights?.includes(RIGHT_ASSET_ASSIGN);
  const canUnassign = !terminal && !!assignee && rights?.includes(RIGHT_ASSET_UNASSIGN);

  useEffect(() => {
    if (uuid) fetchAssignmentHistory(uuid);
  }, [uuid, mutationKey]);

  const items = (assetHistory || []).slice(0, INLINE_LIMIT);

  return (
    <div className={classes.paper}>
      <Grid container direction="column" spacing={2}>
        {/* Show assign button if not assigned and not terminal */}
        {!assignee && !terminal && canAssign && (
          <Grid item>
            <Button
              color="primary"
              variant="contained"
              size="medium"
              startIcon={<PersonAddIcon />}
              onClick={() => setOpenAssign(true)}
              fullWidth
            >
              <FormattedMessage module={MODULE_NAME} id="transition.assign" />
            </Button>
          </Grid>
        )}

        {/* History Table */}
        {uuid && (
          <>
            <Grid item>
              <Typography className={classes.title}>
                <FormattedMessage module={MODULE_NAME} id="assetPage.history.title" />
                {' '}
                {`(${assetHistoryTotalCount ?? 0})`}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <ProgressOrError progress={fetchingAssetHistory} error={errorAssetHistory} />
              {fetchedAssetHistory && items.length === 0 ? (
                <Grid
                  container
                  direction="column"
                  justifyContent="center"
                  alignItems="center"
                  className={classes.emptyStateContainer}
                >
                  <Typography variant="body2" color="textSecondary">
                    {formatMessage(intl, MODULE_NAME, 'assetPage.history.empty')}
                  </Typography>
                </Grid>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow className={classes.tableHeaderRow}>
                      <TableCell variant="head">
                        <FormattedMessage
                          module={MODULE_NAME}
                          id="assetPage.history.columnHeaders.assignedTo"
                        />
                      </TableCell>
                      <TableCell variant="head">
                        <FormattedMessage
                          module={MODULE_NAME}
                          id="assetPage.history.columnHeaders.assignedBy"
                        />
                      </TableCell>
                      <TableCell variant="head">
                        <FormattedMessage
                          module={MODULE_NAME}
                          id="assetPage.history.columnHeaders.assignedDate"
                        />
                      </TableCell>
                      <TableCell variant="head">
                        <FormattedMessage
                          module={MODULE_NAME}
                          id="assetPage.history.columnHeaders.returnedDate"
                        />
                      </TableCell>
                      <TableCell variant="head">
                        <FormattedMessage
                          module={MODULE_NAME}
                          id="assetPage.history.columnHeaders.notes"
                        />
                      </TableCell>
                      <TableCell variant="head" align="right">
                        <FormattedMessage
                          module={MODULE_NAME}
                          id="assetPage.history.columnHeaders.actions"
                        />
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((row, idx) => {
                      const isCurrentAssignment = idx === 0 && !row.returnedDate;
                      return (
                        <TableRow
                          key={row.id ?? idx}
                          hover
                          className={isCurrentAssignment ? classes.activeAssignmentRow : ''}
                        >
                          <TableCell>
                            {formatUser(row.assignedTo || row.toUser)}
                          </TableCell>
                          <TableCell>
                            {formatUser(row.assignedBy || row.performedBy)}
                          </TableCell>
                          <TableCell>
                            {formatDateFromISO(
                              modulesManager,
                              intl,
                              row.assignedDate || row.dateCreated,
                            )}
                          </TableCell>
                          <TableCell>
                            {row.returnedDate
                              ? formatDateFromISO(modulesManager, intl, row.returnedDate)
                              : '—'}
                          </TableCell>
                          <TableCell>{row.notes || '—'}</TableCell>
                          <TableCell align="right">
                            {isCurrentAssignment && (
                              <Grid container spacing={1} justifyContent="flex-end">
                                {canAssign && (
                                  <Grid item>
                                    <Button
                                      color="primary"
                                      variant="outlined"
                                      size="small"
                                      startIcon={<PersonAddIcon />}
                                      onClick={() => setOpenAssign(true)}
                                      className={classes.buttonText}
                                    >
                                      <FormattedMessage
                                        module={MODULE_NAME}
                                        id="transition.reassign"
                                      />
                                    </Button>
                                  </Grid>
                                )}
                                {canUnassign && (
                                  <Grid item>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<PersonAddDisabledIcon />}
                                      onClick={() => setOpenUnassign(true)}
                                      className={`${classes.buttonText} ${classes.unassignButton}`}
                                    >
                                      <FormattedMessage
                                        module={MODULE_NAME}
                                        id="transition.unassign"
                                      />
                                    </Button>
                                  </Grid>
                                )}
                              </Grid>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Grid>
          </>
        )}
      </Grid>

      <AssignAssetDialog
        asset={openAssign ? edited : null}
        onClose={() => setOpenAssign(false)}
      />
      <UnassignAssetDialog
        asset={openUnassign ? edited : null}
        onClose={() => setOpenUnassign(false)}
      />
    </div>
  );
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  fetchingAssetHistory: state.assetManagement.fetchingAssetHistory,
  fetchedAssetHistory: state.assetManagement.fetchedAssetHistory,
  errorAssetHistory: state.assetManagement.errorAssetHistory,
  assetHistory: state.assetManagement.assetHistory,
  assetHistoryTotalCount: state.assetManagement.assetHistoryTotalCount,
  mutationKey: state.assetManagement.mutation?.clientMutationId ?? null,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchAssignmentHistory }, dispatch);

export default injectIntl(
  withModulesManager(
    withTheme(
      withStyles(styles)(
        connect(mapStateToProps, mapDispatchToProps)(AssetAssignmentPanel),
      ),
    ),
  ),
);
