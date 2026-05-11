import {
  graphql,
  formatPageQueryWithCount,
  formatMutation,
  formatGQLString,
} from '@openimis/fe-core';

import { ACTION_TYPE } from './reducer';
import { ASSET_PROJECTION } from './constants';
import { REQUEST, SUCCESS, ERROR } from './utils/action-type';

/**
 * Fetch a paginated, filtered list of assets.
 *
 * `params` is the openIMIS Searcher params array (filter fragments + sort + paging).
 * The GraphQL root is `asset`; field names assumed:
 *   code_Icontains, name_Icontains, serialNumber_Icontains,
 *   deviceType, status, location_Uuid, assignedTo_Uuid, isDeleted.
 * Will be reconciled against the backend schema once the asset_management
 * backend lands.
 */
export function fetchAssets(params) {
  const payload = formatPageQueryWithCount('asset', params, ASSET_PROJECTION);
  return graphql(payload, ACTION_TYPE.SEARCH_ASSETS);
}

/**
 * Delete a single asset (soft delete on the backend).
 */
export function deleteAsset(asset, clientMutationLabel) {
  const input = `uuids: ["${asset?.uuid}"]`;
  const mutation = formatMutation('deleteAsset', input, clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.DELETE_ASSET), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.DELETE_ASSET,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

/**
 * Assign an asset to a user.
 *
 * @param {string} assetUuid
 * @param {string} userUuid
 * @param {string} [notes]
 * @param {boolean} [force] when true, the backend will unassign the current
 *   assignee (if any) before performing the assignment.
 */
export function assignAsset(assetUuid, userUuid, notes, force, clientMutationLabel) {
  const input = `
    assetUuid: "${assetUuid}"
    userUuid: "${userUuid}"
    ${notes ? `notes: "${formatGQLString(notes)}"` : ''}
    ${force ? 'force: true' : ''}
  `;
  const mutation = formatMutation('assignAsset', input, clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.ASSIGN_ASSET), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.ASSIGN_ASSET,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function unassignAsset(assetUuid, notes, clientMutationLabel) {
  const input = `
    assetUuid: "${assetUuid}"
    ${notes ? `notes: "${formatGQLString(notes)}"` : ''}
  `;
  const mutation = formatMutation('unassignAsset', input, clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.UNASSIGN_ASSET), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.UNASSIGN_ASSET,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

/**
 * Non-assignment status transition (to MAINTENANCE / IN_STOCK / RETIRED / LOST).
 * The client-side FSM should validate the target before dispatching.
 */
export function transitionAssetStatus(assetUuid, targetStatus, notes, clientMutationLabel) {
  const input = `
    assetUuid: "${assetUuid}"
    targetStatus: ${targetStatus}
    ${notes ? `notes: "${formatGQLString(notes)}"` : ''}
  `;
  const mutation = formatMutation('transitionAssetStatus', input, clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.TRANSITION_ASSET), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.TRANSITION_ASSET,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}
