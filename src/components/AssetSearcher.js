import React, { useEffect, useRef, useState } from 'react';
import { injectIntl } from 'react-intl';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  Searcher,
  formatMessage,
  formatMessageWithValues,
  formatDateFromISO,
  withModulesManager,
  withHistory,
  historyPush,
  coreConfirm,
  clearConfirm,
  journalize,
} from '@openimis/fe-core';

import {
  DEFAULT_PAGE_SIZE,
  ROWS_PER_PAGE_OPTIONS,
  MODULE_NAME,
} from '../constants';
import {
  fetchAssets,
  deleteAsset,
  transitionAssetStatus,
} from '../actions';
import useAssetActions from '../hooks/useAssetActions';
import AssetIcon from '../displays/AssetIcon';
import AssetFilter from './AssetFilter';
import buildAssetRowActions from './AssetRowActions';
import AssignAssetDialog from './AssignAssetDialog';
import UnassignAssetDialog from './UnassignAssetDialog';

/**
 * AssetSearcher
 *
 * Wraps Core `Searcher` and orchestrates the per-row action menu plus its
 * dialogs.
 *
 *   - Delete  -> coreConfirm + deleteAsset
 *   - Assign  -> AssignAssetDialog
 *   - Unassign-> UnassignAssetDialog
 *   - Transitions (maintenance / in-stock / retire / lost)
 *                 -> coreConfirm + transitionAssetStatus
 */
function AssetSearcher({
  intl,
  modulesManager,
  history,
  rights,
  fetchAssets,
  deleteAsset,
  transitionAssetStatus,
  coreConfirm,
  clearConfirm,
  confirmed,
  journalize,
  submittingMutation,
  mutation,
  fetchingAssets,
  fetchedAssets,
  errorAssets,
  assets,
  assetsPageInfo,
  assetsTotalCount,
  defaultFilters: callerDefaultFilters,
}) {
  // ----- Local state for action orchestration -----
  const [assetToAssign, setAssetToAssign] = useState(null);
  const [assetToUnassign, setAssetToUnassign] = useState(null);
  const [deletedAssetUuids, setDeletedAssetUuids] = useState([]);
  const prevSubmittingRef = useRef();
  const lastFetchParamsRef = useRef();

  // Re-fetch the list after any mutation completes so row actions reflect new status
  useEffect(() => {
    if (prevSubmittingRef.current && !submittingMutation && lastFetchParamsRef.current) {
      fetchAssets(lastFetchParamsRef.current);
    }
    prevSubmittingRef.current = submittingMutation;
  }, [submittingMutation]);

  // ----- Shared hook for delete + transition confirmations -----
  const {
    openDeleteConfirm,
    openTransitionConfirm,
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
      setDeletedAssetUuids([...deletedAssetUuids, asset.uuid]);
    },
    onTransition: (asset, target) => {
      const statusLabel = formatMessage(intl, MODULE_NAME, `asset.status.${target}`);
      transitionAssetStatus(
        asset.uuid,
        target,
        null,
        formatMessage(intl, MODULE_NAME, 'asset.transition.mutationLabel', {
          status: statusLabel,
        }),
      );
    },
    confirmed,
    submittingMutation,
    mutation,
  });

  // ----- Searcher plumbing -----
  const fetch = (params) => {
    lastFetchParamsRef.current = params;
    fetchAssets(params);
  };

  const headers = () => [
    'asset.deviceType',
    'asset.name',
    'asset.serialNumber',
    'asset.status',
    'asset.location',
    'asset.assignedTo',
    'asset.dateUpdated',
    'emptyLabel',
  ];

  const formatAssignedTo = (asset) => {
    const u = asset.assignedTo;
    if (!u) return '';
    return [u.lastName, u.otherNames].filter(Boolean).join(' ');
  };

  // Build row action formatters once per render; callbacks call the
  // shared hook methods to open confirmations.
  const rowActionFormatters = buildAssetRowActions({
    intl,
    modulesManager,
    history,
    rights,
    onAssign: (asset) => setAssetToAssign(asset),
    onUnassign: (asset) => setAssetToUnassign(asset),
    onTransition: (asset, target) => openTransitionConfirm(asset, target),
    onDelete: (asset) => openDeleteConfirm(asset),
  });

  const formatStatus = (asset) => {
    if (!asset.status) return '';
    const key = `asset.status.${asset.status.code}`;
    const translated = formatMessage(intl, MODULE_NAME, key);
    if (!translated || translated === key || translated.endsWith(`.${key}`)) {
      return asset.status.name || asset.status.code;
    }
    return translated;
  };

  const itemFormatters = () => [
    (asset) => <AssetIcon deviceType={asset.deviceType?.code} />,
    (asset) => asset.name,
    (asset) => asset.serialNumber,
    (asset) => formatStatus(asset),
    (asset) => asset.location?.name ?? '',
    (asset) => formatAssignedTo(asset),
    (asset) => formatDateFromISO(modulesManager, intl, asset.dateUpdated),
    (asset) => (
      <>
        {rowActionFormatters.map((fmt, idx) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={`asset-row-action-${idx}`}>{fmt(asset)}</span>
        ))}
      </>
    ),
  ];

  const sorts = () => [
    ['deviceType', true],
    ['name', true],
    ['serialNumber', true],
    ['status', true],
    ['location', true],
    ['assignedTo', true],
    ['dateUpdated', true],
  ];

  const onDoubleClick = (asset, newTab = false) => historyPush(
    modulesManager,
    history,
    'assetManagement.route.asset',
    [asset?.uuid],
    newTab,
  );

  const rowIdentifier = (asset) => asset.uuid;

  const isRowDisabled = (_, asset) => deletedAssetUuids.includes(asset.uuid);

  const defaultFilters = () => ({
    isDeleted: { value: false, filter: 'isDeleted: false' },
    ...(callerDefaultFilters || {}),
  });

  return (
    <>
      <Searcher
        module={MODULE_NAME}
        FilterPane={AssetFilter}
        fetch={fetch}
        items={assets}
        itemsPageInfo={assetsPageInfo}
        fetchingItems={fetchingAssets}
        fetchedItems={fetchedAssets}
        errorItems={errorAssets}
        tableTitle={formatMessageWithValues(
          intl,
          MODULE_NAME,
          'assetsPage.searcherResultsTitle',
          { assetsTotalCount: assetsTotalCount ?? 0 },
        )}
        headers={headers}
        itemFormatters={itemFormatters}
        sorts={sorts}
        rowIdentifier={rowIdentifier}
        onDoubleClick={onDoubleClick}
        defaultFilters={defaultFilters()}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        defaultOrderBy="-dateUpdated"
        rowDisabled={isRowDisabled}
        rowLocked={isRowDisabled}
      />
      <AssignAssetDialog
        asset={assetToAssign}
        onClose={() => setAssetToAssign(null)}
      />
      <UnassignAssetDialog
        asset={assetToUnassign}
        onClose={() => setAssetToUnassign(null)}
      />
    </>
  );
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  confirmed: state.core?.confirmed,
  fetchingAssets: state.assetManagement.fetchingAssets,
  fetchedAssets: state.assetManagement.fetchedAssets,
  errorAssets: state.assetManagement.errorAssets,
  assets: state.assetManagement.assets,
  assetsPageInfo: state.assetManagement.assetsPageInfo,
  assetsTotalCount: state.assetManagement.assetsTotalCount,
  submittingMutation: state.assetManagement.submittingMutation,
  mutation: state.assetManagement.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchAssets,
    deleteAsset,
    transitionAssetStatus,
    coreConfirm,
    clearConfirm,
    journalize,
  },
  dispatch,
);

export default injectIntl(
  withHistory(
    withModulesManager(
      connect(mapStateToProps, mapDispatchToProps)(AssetSearcher),
    ),
  ),
);
