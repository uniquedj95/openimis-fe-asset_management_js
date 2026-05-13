import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withTheme, withStyles } from '@material-ui/core/styles';

import {
  Searcher,
  FormattedMessage,
  formatDateFromISO,
  withModulesManager,
} from '@openimis/fe-core';

import { MODULE_NAME, DEFAULT_PAGE_SIZE, ROWS_PER_PAGE_OPTIONS } from '../constants';
import { fetchAssignmentHistory } from '../actions';
import { assetUuid } from '../utils/asset';

const styles = (theme) => ({
  item: theme.paper.item,
  paper: theme.paper.paper,
  title: theme.paper.title,
});

function formatUser(u) {
  if (!u) return '—';
  return [u.lastName, u.otherNames].filter(Boolean).join(' ') || u.username || '—';
}

/**
 * AssetAssignmentPanel
 *
 * Displays assignment history for a single asset using the openIMIS Searcher.
 */
function AssetAssignmentPanel({
  intl, classes, modulesManager, edited,
  fetchingAssetHistory, fetchedAssetHistory, errorAssetHistory,
  assetHistory, assetHistoryPageInfo, assetHistoryTotalCount,
  fetchAssignmentHistory,
}) {
  const uuid = assetUuid(edited);

  if (!uuid) return null;

  const fetch = (params) => fetchAssignmentHistory(params);

  const defaultFilters = () => ({
    asset_Id: { value: uuid, filter: `asset_Id: "${uuid}"` },
  });

  const headers = () => [
    'assetPage.history.columnHeaders.assignedTo',
    'assetPage.history.columnHeaders.assignedBy',
    'assetPage.history.columnHeaders.assignedDate',
    'assetPage.history.columnHeaders.returnedDate',
    'assetPage.history.columnHeaders.notes',
  ];

  const itemFormatters = () => [
    (row) => formatUser(row.assignedTo),
    (row) => formatUser(row.assignedBy),
    (row) => formatDateFromISO(modulesManager, intl, row.assignedDate),
    (row) => (row.returnedDate ? formatDateFromISO(modulesManager, intl, row.returnedDate) : '—'),
    (row) => row.notes || '—',
  ];

  const sorts = () => [
    ['assignedTo', false],
    ['assignedBy', false],
    ['assignedDate', true],
    ['returnedDate', true],
    null,
  ];

  const rowIdentifier = (row) => row.id;

  return (
    <div className={classes.paper}>
      <Searcher
        module={MODULE_NAME}
        fetch={fetch}
        items={assetHistory}
        itemsPageInfo={assetHistoryPageInfo}
        fetchingItems={fetchingAssetHistory}
        fetchedItems={fetchedAssetHistory}
        errorItems={errorAssetHistory}
        tableTitle={(
          <FormattedMessage
            module={MODULE_NAME}
            id="assetPage.history.title"
            values={{ count: assetHistoryTotalCount ?? 0 }}
          />
        )}
        headers={headers}
        itemFormatters={itemFormatters}
        sorts={sorts}
        rowIdentifier={rowIdentifier}
        defaultFilters={defaultFilters()}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        defaultOrderBy="-assignedDate"
      />
    </div>
  );
}

const mapStateToProps = (state) => ({
  fetchingAssetHistory: state.assetManagement.fetchingAssetHistory,
  fetchedAssetHistory: state.assetManagement.fetchedAssetHistory,
  errorAssetHistory: state.assetManagement.errorAssetHistory,
  assetHistory: state.assetManagement.assetHistory,
  assetHistoryPageInfo: state.assetManagement.assetHistoryPageInfo,
  assetHistoryTotalCount: state.assetManagement.assetHistoryTotalCount,
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
