// Disabled due to consistency with other modules
/* eslint-disable default-param-last */

import {
  dispatchMutationErr,
  dispatchMutationReq,
  dispatchMutationResp,
  formatGraphQLError,
  formatServerError,
  pageInfo,
  parseData,
} from '@openimis/fe-core';
import {
  CLEAR, ERROR, REQUEST, SUCCESS,
} from './utils/action-type';

export const ACTION_TYPE = {
  MUTATION: 'ASSET_MGMT_MUTATION',
  SEARCH_ASSETS: 'ASSET_MGMT_ASSETS',
  GET_ASSET: 'ASSET_MGMT_ASSET',
  GET_ASSET_HISTORY: 'ASSET_MGMT_HISTORY',
  CREATE_ASSET: 'ASSET_MGMT_CREATE_ASSET',
  UPDATE_ASSET: 'ASSET_MGMT_UPDATE_ASSET',
  DELETE_ASSET: 'ASSET_MGMT_DELETE_ASSET',
  ASSIGN_ASSET: 'ASSET_MGMT_ASSIGN_ASSET',
  UNASSIGN_ASSET: 'ASSET_MGMT_UNASSIGN_ASSET',
  TRANSITION_ASSET: 'ASSET_MGMT_TRANSITION_ASSET',
};

const initialState = {
  // Mutations
  submittingMutation: false,
  mutation: {},

  // Assets list (searcher)
  fetchingAssets: false,
  fetchedAssets: false,
  errorAssets: null,
  assets: [],
  assetsPageInfo: {},
  assetsTotalCount: 0,

  // Single asset
  fetchingAsset: false,
  fetchedAsset: false,
  errorAsset: null,
  asset: null,

  // Assignment history
  fetchingAssetHistory: false,
  fetchedAssetHistory: false,
  errorAssetHistory: null,
  assetHistory: [],
  assetHistoryPageInfo: {},
  assetHistoryTotalCount: 0,
};

function reducer(state = initialState, action) {
  switch (action.type) {
    // ---------- Assets list ----------
    case REQUEST(ACTION_TYPE.SEARCH_ASSETS):
      return {
        ...state,
        fetchingAssets: true,
        fetchedAssets: false,
        assets: [],
        assetsPageInfo: {},
        assetsTotalCount: 0,
        errorAssets: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_ASSETS):
      return {
        ...state,
        fetchingAssets: false,
        fetchedAssets: true,
        assets: parseData(action.payload.data.assets),
        assetsPageInfo: pageInfo(action.payload.data.assets),
        assetsTotalCount: action.payload.data.assets?.totalCount ?? 0,
        errorAssets: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_ASSETS):
      return {
        ...state,
        fetchingAssets: false,
        errorAssets: formatServerError(action.payload),
      };

    // ---------- Single asset ----------
    case REQUEST(ACTION_TYPE.GET_ASSET):
      return {
        ...state,
        fetchingAsset: true,
        fetchedAsset: false,
        asset: null,
        errorAsset: null,
      };
    case SUCCESS(ACTION_TYPE.GET_ASSET):
      return {
        ...state,
        fetchingAsset: false,
        fetchedAsset: true,
        asset: parseData(action.payload.data.assets)?.[0] ?? null,
        errorAsset: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_ASSET):
      return {
        ...state,
        fetchingAsset: false,
        errorAsset: formatServerError(action.payload),
      };
    case CLEAR(ACTION_TYPE.GET_ASSET):
      return {
        ...state,
        fetchingAsset: false,
        fetchedAsset: false,
        asset: null,
        errorAsset: null,
      };

    // ---------- Assignment history ----------
    case REQUEST(ACTION_TYPE.GET_ASSET_HISTORY):
      return {
        ...state,
        fetchingAssetHistory: true,
        fetchedAssetHistory: false,
        assetHistory: [],
        assetHistoryPageInfo: {},
        assetHistoryTotalCount: 0,
        errorAssetHistory: null,
      };
    case SUCCESS(ACTION_TYPE.GET_ASSET_HISTORY):
      return {
        ...state,
        fetchingAssetHistory: false,
        fetchedAssetHistory: true,
        assetHistory: parseData(action.payload.data.assetAssignments),
        assetHistoryPageInfo: pageInfo(action.payload.data.assetAssignments),
        assetHistoryTotalCount: action.payload.data.assetAssignments?.totalCount ?? 0,
        errorAssetHistory: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_ASSET_HISTORY):
      return {
        ...state,
        fetchingAssetHistory: false,
        errorAssetHistory: formatServerError(action.payload),
      };

    // ---------- Mutation lifecycle ----------
    case REQUEST(ACTION_TYPE.MUTATION):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.MUTATION):
      return dispatchMutationErr(state, action);

    case SUCCESS(ACTION_TYPE.CREATE_ASSET):
    case SUCCESS(ACTION_TYPE.UPDATE_ASSET):
    case SUCCESS(ACTION_TYPE.DELETE_ASSET):
    case SUCCESS(ACTION_TYPE.ASSIGN_ASSET):
    case SUCCESS(ACTION_TYPE.UNASSIGN_ASSET):
    case SUCCESS(ACTION_TYPE.TRANSITION_ASSET):
      return dispatchMutationResp(state, action.meta.actionType, action);

    default:
      return state;
  }
}

export default reducer;
