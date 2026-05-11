import React, { useEffect, useRef, useState } from 'react';
import { injectIntl } from 'react-intl';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  Searcher,
  PublishedComponent,
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
import AssetIcon from '../displays/AssetIcon';
import AssetFilter from './AssetFilter';
import buildAssetRowActions from './AssetRowActions';
import AssignAssetDialog from './AssignAssetDialog';
import UnassignAssetDialog from './UnassignAssetDialog';

/**
 * AssetSearcher (Tasks #18 & #20 wiring)
 *
 * Wraps Core `Searcher` and orchestrates the per-row action menu plus its
 * dialogs. Mirrors the openIMIS standard set by InvoiceSearcher /
 * BenefitPlanSearcher: `coreConfirm` + `journalize` live inside the
 * Searcher, not the Page.
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
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [assetToAssign, setAssetToAssign] = useState(null);
  const [assetToUnassign, setAssetToUnassign] = useState(null);
  const [pendingTransition, setPendingTransition] = useState(null); // { asset, target }
  const [deletedAssetUuids, setDeletedAssetUuids] = useState([]);
  const prevSubmittingMutationRef = useRef();

  // ----- Delete: coreConfirm -> deleteAsset -----
  const openDeleteConfirm = () => coreConfirm(
    formatMessageWithValues(intl, MODULE_NAME, 'asset.delete.confirm.title', {
      code: assetToDelete.code,
      name: assetToDelete.name,
    }),
    formatMessage(intl, MODULE_NAME, 'asset.delete.confirm.message'),
  );

  useEffect(() => {
    if (assetToDelete) openDeleteConfirm();
  }, [assetToDelete]);

  // ----- Transition: coreConfirm -> transitionAssetStatus -----
  const openTransitionConfirm = () => coreConfirm(
    formatMessageWithValues(intl, MODULE_NAME, 'asset.transition.confirm.title', {
      status: formatMessage(intl, MODULE_NAME, `asset.status.${pendingTransition.target}`),
    }),
    formatMessageWithValues(intl, MODULE_NAME, 'asset.transition.confirm.message', {
      code: pendingTransition.asset.code,
      name: pendingTransition.asset.name,
      status: formatMessage(intl, MODULE_NAME, `asset.status.${pendingTransition.target}`),
    }),
  );

  useEffect(() => {
    if (pendingTransition) openTransitionConfirm();
  }, [pendingTransition]);

  // ----- Single confirmed-effect handles both delete + transition -----
  useEffect(() => {
    if (assetToDelete && confirmed) {
      deleteAsset(
        assetToDelete,
        formatMessageWithValues(intl, MODULE_NAME, 'asset.delete.mutationLabel', {
          code: assetToDelete.code,
        }),
      );
      setDeletedAssetUuids([...deletedAssetUuids, assetToDelete.uuid]);
    }
    if (assetToDelete && confirmed !== null) setAssetToDelete(null);

    if (pendingTransition && confirmed) {
      transitionAssetStatus(
        pendingTransition.asset.uuid,
        pendingTransition.target,
        null,
        formatMessageWithValues(intl, MODULE_NAME, 'asset.transition.mutationLabel', {
          code: pendingTransition.asset.code,
          status: formatMessage(intl, MODULE_NAME, `asset.status.${pendingTransition.target}`),
        }),
      );
    }
    if (pendingTransition && confirmed !== null) setPendingTransition(null);

    return () => confirmed && clearConfirm(false);
  }, [confirmed]);

  // ----- Journalize after a mutation settles -----
  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  // ----- Searcher plumbing -----
  const fetch = (params) => fetchAssets(params);

  const headers = () => [
    'asset.deviceType',
    'asset.code',
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

  // Build row action formatters once per render; callbacks just set local
  // state so the Searcher's shallow comparison stays stable enough.
  const rowActionFormatters = buildAssetRowActions({
    intl,
    modulesManager,
    history,
    rights,
    onAssign: (asset) => setAssetToAssign(asset),
    onUnassign: (asset) => setAssetToUnassign(asset),
    onTransition: (asset, target) => setPendingTransition({ asset, target }),
    onDelete: (asset) => setAssetToDelete(asset),
  });

  const itemFormatters = () => [
    (asset) => <AssetIcon deviceType={asset.deviceType} />,
    (asset) => asset.code,
    (asset) => asset.name,
    (asset) => asset.serialNumber,
    (asset) => (
      <PublishedComponent
        pubRef="assetManagement.AssetStatusPicker"
        readOnly
        withLabel={false}
        withNull={false}
        value={asset.status}
      />
    ),
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
    ['code', true],
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
