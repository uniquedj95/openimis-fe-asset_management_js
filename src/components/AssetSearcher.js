import React from 'react';
import { injectIntl } from 'react-intl';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  Searcher,
  PublishedComponent,
  formatMessageWithValues,
  formatDateFromISO,
  withModulesManager,
  withHistory,
  historyPush,
} from '@openimis/fe-core';

import {
  DEFAULT_PAGE_SIZE,
  ROWS_PER_PAGE_OPTIONS,
  MODULE_NAME,
  RIGHT_ASSET_UPDATE,
} from '../constants';
import { fetchAssets } from '../actions';
import AssetIcon from '../displays/AssetIcon';
import AssetFilter from './AssetFilter';

function AssetSearcher({
  intl,
  modulesManager,
  history,
  rights,
  fetchAssets,
  fetchingAssets,
  fetchedAssets,
  errorAssets,
  assets,
  assetsPageInfo,
  assetsTotalCount,
  // Optional caller-supplied filters merged into defaultFilters (e.g. assignedTo).
  defaultFilters: callerDefaultFilters,
  // Optional row action renderers; #19 will plug in here.
  actionFormatters,
}) {
  const fetch = (params) => fetchAssets(params);

  const headers = () => {
    const base = [
      'asset.deviceType',
      'asset.code',
      'asset.name',
      'asset.serialNumber',
      'asset.status',
      'asset.location',
      'asset.assignedTo',
      'asset.dateUpdated',
    ];
    if (actionFormatters?.length || rights.includes(RIGHT_ASSET_UPDATE)) {
      base.push('emptyLabel');
    }
    return base;
  };

  const formatAssignedTo = (asset) => {
    const u = asset.assignedTo;
    if (!u) return '';
    return [u.lastName, u.otherNames].filter(Boolean).join(' ');
  };

  const itemFormatters = () => {
    const base = [
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
    ];
    if (actionFormatters?.length) {
      base.push((asset) => (
        <>{actionFormatters.map((fmt, idx) => <span key={idx}>{fmt(asset)}</span>)}</>
      ));
    }
    return base;
  };

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

  const defaultFilters = () => ({
    isDeleted: { value: false, filter: 'isDeleted: false' },
    ...(callerDefaultFilters || {}),
  });

  return (
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
    />
  );
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  fetchingAssets: state.assetManagement.fetchingAssets,
  fetchedAssets: state.assetManagement.fetchedAssets,
  errorAssets: state.assetManagement.errorAssets,
  assets: state.assetManagement.assets,
  assetsPageInfo: state.assetManagement.assetsPageInfo,
  assetsTotalCount: state.assetManagement.assetsTotalCount,
  submittingMutation: state.assetManagement.submittingMutation,
  mutation: state.assetManagement.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchAssets }, dispatch);

export default injectIntl(
  withHistory(
    withModulesManager(
      connect(mapStateToProps, mapDispatchToProps)(AssetSearcher),
    ),
  ),
);
