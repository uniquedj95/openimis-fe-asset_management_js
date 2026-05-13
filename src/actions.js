import {
  graphql,
  formatPageQuery,
  formatPageQueryWithCount,
  formatMutation,
  formatGQLString,
  decodeId,
} from '@openimis/fe-core';

import { ACTION_TYPE } from './reducer';
import { ASSET_PROJECTION, ASSIGNMENT_PROJECTION, ASSET_STATUS } from './constants';
import {
  REQUEST, SUCCESS, ERROR, CLEAR,
} from './utils/action-type';
import { asUuid } from './utils/asset';

/**
 * Fetch a paginated, filtered list of assets.
 *
 * Backend `assets` connection (openimis-be-asset) supports:
 *   `id`, `name`, `name_Icontains`, `serialNumber`, `serialNumber_Icontains`,
 *   `status_Code`, `deviceType_Code`, `location_Id`, `assignedTo_Id`,
 *   `isDeleted`, `showHistory`, `orderBy`.
 */
export function fetchAssets(params) {
  const payload = formatPageQueryWithCount('assets', params, ASSET_PROJECTION);
  return graphql(payload, ACTION_TYPE.SEARCH_ASSETS);
}

/**
 * Fetch a single asset by its raw UUID (or relay-encoded id).
 *
 * Re-uses the `assets` connection filtered by `id` since the backend does not
 * expose a stand-alone `asset(uuid: ...)` field. The reducer pulls the first
 * edge into `state.asset`. Returns a no-op CLEAR when `uuid` is falsy so the
 * page works in create mode without firing a request.
 */
export function fetchAsset(uuid) {
  const raw = asUuid(uuid);
  if (!raw) {
    return { type: CLEAR(ACTION_TYPE.GET_ASSET) };
  }
  const payload = formatPageQuery('assets', [`id: "${raw}"`], ASSET_PROJECTION);
  return graphql(payload, ACTION_TYPE.GET_ASSET);
}

/** Reset the single-asset slice (used when leaving the detail page). */
export function clearAsset() {
  return { type: CLEAR(ACTION_TYPE.GET_ASSET) };
}

/**
 * Assignment-history entries for an asset, newest first.
 */
export function fetchAssignmentHistory(assetUuid) {
  const raw = asUuid(assetUuid);
  if (!raw) return { type: CLEAR(ACTION_TYPE.GET_ASSET_HISTORY) };
  const payload = formatPageQueryWithCount(
    'assetAssignments',
    [`asset_Id: "${raw}"`, 'orderBy: ["-assignedDate"]'],
    ASSIGNMENT_PROJECTION,
  );
  return graphql(payload, ACTION_TYPE.GET_ASSET_HISTORY);
}

// --------------------------------------------------------------------------- //
// Mutations
// --------------------------------------------------------------------------- //

function decodeOrNull(id) {
  if (!id) return null;
  return /-/.test(id) ? id : decodeId(id);
}

function buildAssetMutationInput(asset) {
  // Map an in-memory form object to the camelCased input fields exposed by the
  // backend `createAsset` / `updateAsset` mutations.
  const lines = [
    `name: "${formatGQLString(asset.name ?? '')}"`,
    `serialNumber: "${formatGQLString(asset.serialNumber ?? '')}"`,
  ];
  if (asset.imei) lines.push(`imei: "${formatGQLString(asset.imei)}"`);
  if (asset.manufacturer) lines.push(`manufacturer: "${formatGQLString(asset.manufacturer)}"`);
  if (asset.model) lines.push(`model: "${formatGQLString(asset.model)}"`);
  if (asset.osVersion) lines.push(`osVersion: "${formatGQLString(asset.osVersion)}"`);

  const deviceTypeId = decodeOrNull(asset.deviceType?.id);
  if (deviceTypeId) lines.push(`deviceTypeId: "${deviceTypeId}"`);
  const statusId = decodeOrNull(asset.status?.id);
  if (statusId) lines.push(`statusId: "${statusId}"`);
  // location_id is an integer FK on the backend; pass the decoded numeric id.
  const rawLocationId = decodeOrNull(asset.location?.id);
  if (rawLocationId) lines.push(`locationId: ${parseInt(rawLocationId, 10)}`);
  return lines.join('\n');
}

export function createAsset(asset, clientMutationLabel) {
  const input = buildAssetMutationInput(asset);
  const mutation = formatMutation('createAsset', input, clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.CREATE_ASSET), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.CREATE_ASSET,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function updateAsset(asset, clientMutationLabel) {
  const uuid = asUuid(asset.uuid || asset.id);
  const input = `uuid: "${uuid}"\n${buildAssetMutationInput(asset)}`;
  const mutation = formatMutation('updateAsset', input, clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.UPDATE_ASSET), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.UPDATE_ASSET,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function deleteAsset(asset, clientMutationLabel) {
  const uuid = asUuid(asset?.uuid || asset?.id);
  const input = `uuid: "${uuid}"`;
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
 * `assetUuid` and `userUuid` may be raw UUIDs or relay-encoded ids; both are
 * decoded before being sent. The `force` flag is reserved for a future backend
 * extension and is currently a no-op.
 */
export function assignAsset(assetUuid, userUuid, notes, _force, clientMutationLabel) {
  const input = `
    uuid: "${asUuid(assetUuid)}"
    userUuid: "${asUuid(userUuid)}"
    ${notes ? `notes: "${formatGQLString(notes)}"` : ''}
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
    uuid: "${asUuid(assetUuid)}"
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

// --------------------------------------------------------------------------- //
// Status transitions
// --------------------------------------------------------------------------- //

const TRANSITION_MUTATIONS = {
  [ASSET_STATUS.REPAIR]: 'markAssetForRepair',
  [ASSET_STATUS.RETIRED]: 'retireAsset',
};

/**
 * Dispatch the appropriate backend mutation for the requested target status.
 *
 * The backend exposes dedicated mutations only for `repair` and `retired`.
 * Other targets (return-to-available, mark-lost) are not yet supported and
 * resolve to a no-op error action so the UI can surface a friendly message.
 */
export function transitionAssetStatus(assetUuid, targetStatus, notes, clientMutationLabel) {
  const mutationName = TRANSITION_MUTATIONS[targetStatus];
  if (!mutationName) {
    return {
      type: ERROR(ACTION_TYPE.MUTATION),
      payload: { message: `Transition to "${targetStatus}" is not supported by the backend.` },
      meta: {
        actionType: ACTION_TYPE.TRANSITION_ASSET,
        clientMutationLabel,
      },
    };
  }
  const input = `
    uuid: "${asUuid(assetUuid)}"
    ${notes ? `notes: "${formatGQLString(notes)}"` : ''}
  `;
  const mutation = formatMutation(mutationName, input, clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.TRANSITION_ASSET), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.TRANSITION_ASSET,
      mutationName,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}
