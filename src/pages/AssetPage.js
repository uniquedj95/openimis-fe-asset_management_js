import React, {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  Helmet,
  withModulesManager,
  withHistory,
  historyPush,
  formatMessage,
  formatMessageWithValues,
  journalize,
  coreAlert,
} from '@openimis/fe-core';

import {
  MODULE_NAME,
  RIGHT_ASSET_SEARCH,
  RIGHT_ASSET_CREATE,
  RIGHT_ASSET_UPDATE,
} from '../constants';
import {
  fetchAsset, clearAsset, createAsset, updateAsset,
} from '../actions';
import { assetLabel } from '../utils/asset';
import AssetForm from '../components/AssetForm';

/**
 * AssetPage
 *
 * Single-asset create / edit page. The route param `:asset_uuid?` is the raw
 * UUID pushed by the list page. Dirty tracking and Save/Cancel are owned by
 * the embedded `<Form>` (see AssetForm).
 *
 * Lifecycle:
 *   1. Mount → dispatch `fetchAsset(uuid)` (no-op when `uuid` is absent).
 *   2. On `fetchedAsset`, hydrate the local `edited` state from the store.
 *   3. Save → `createAsset` or `updateAsset` with a localized mutation label;
 *      once the mutation settles, journalize, then redirect back to the list.
 */
function AssetPage({
  intl, match, history, modulesManager, rights,
  asset, fetchingAsset, fetchedAsset, errorAsset,
  submittingMutation, mutation,
  fetchAsset, clearAsset, createAsset, updateAsset, journalize, coreAlert,
}) {
  const uuidParam = match.params.asset_uuid;
  const isCreate = !uuidParam;
  const canView = rights?.includes(RIGHT_ASSET_SEARCH);
  const canSubmit = isCreate
    ? rights?.includes(RIGHT_ASSET_CREATE)
    : rights?.includes(RIGHT_ASSET_UPDATE);
  const readOnly = !canSubmit;

  const [edited, setEdited] = useState({});
  const [resetKey, setResetKey] = useState(0);
  const [pendingRedirect, setPendingRedirect] = useState(false);
  const prevSubmittingRef = useRef();

  // Redirect unauthorized users to home with error toast
  useEffect(() => {
    // Wait for rights to load (non-empty array)
    if (rights.length > 0 && !canView) {
      coreAlert(
        formatMessage(intl, MODULE_NAME, 'error.insufficientRights'),
        formatMessage(intl, MODULE_NAME, 'assetPage.helmet'),
      );
      historyPush(modulesManager, history, 'home');
    }
  }, [rights, canView]);

  useEffect(() => {
    if (uuidParam) fetchAsset(uuidParam);
    else clearAsset();
    return () => clearAsset();
  }, [uuidParam]);

  useEffect(() => {
    if (isCreate) {
      setEdited({});
      return;
    }
    if (fetchedAsset && asset) {
      setEdited(asset);
    }
  }, [fetchedAsset, asset, isCreate]);

  const back = () => historyPush(modulesManager, history, 'assetManagement.route.assets');

  const onSave = (values) => {
    const next = values ?? edited;
    const label = formatMessageWithValues(
      intl,
      MODULE_NAME,
      isCreate ? 'mutation.createAssetLabel' : 'mutation.updateAssetLabel',
      { serialNumber: assetLabel(next) },
    );
    if (isCreate) createAsset(next, label);
    else updateAsset(next, label);
    setPendingRedirect(true);
  };

  const onReset = () => {
    setEdited(isCreate ? {} : (asset ?? {}));
    setResetKey((k) => k + 1);
  };

  // Journalize + redirect after a successful create/update.
  useEffect(() => {
    if (prevSubmittingRef.current && !submittingMutation) {
      journalize(mutation);
      if (pendingRedirect && !mutation?.error) {
        setPendingRedirect(false);
        back();
      }
    }
  }, [submittingMutation]);

  useEffect(() => { prevSubmittingRef.current = submittingMutation; });

  const canSave = useMemo(() => () => {
    if (!edited?.name || !edited?.serialNumber) return false;
    if (!edited?.deviceType?.code) return false;
    if (!edited?.location) return false;
    return !submittingMutation;
  }, [edited, submittingMutation]);

  // Show nothing while auth is loading or user lacks view permission
  if (rights.length === 0 || !canView) return null;

  return (
    <>
      <Helmet title={formatMessage(intl, MODULE_NAME, 'assetPage.helmet')} />
      <AssetForm
        key={resetKey}
        asset={asset}
        edited={edited}
        readOnly={readOnly}
        fetchingAsset={fetchingAsset}
        error={errorAsset}
        onChange={setEdited}
        onSave={canSubmit ? onSave : undefined}
        onBack={back}
        onReset={onReset}
        canSave={canSave}
      />
    </>
  );
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  asset: state.assetManagement.asset,
  fetchingAsset: state.assetManagement.fetchingAsset,
  fetchedAsset: state.assetManagement.fetchedAsset,
  errorAsset: state.assetManagement.errorAsset,
  submittingMutation: state.assetManagement.submittingMutation,
  mutation: state.assetManagement.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchAsset, clearAsset, createAsset, updateAsset, journalize, coreAlert,
}, dispatch);

export default withModulesManager(
  withHistory(
    injectIntl(
      connect(mapStateToProps, mapDispatchToProps)(AssetPage),
    ),
  ),
);
