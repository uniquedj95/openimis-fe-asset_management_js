import { decodeId } from '@openimis/fe-core';

/**
 * Resolve an asset's raw UUID from a node returned by `parseData`.
 *
 * The GraphQL connection exposes the relay-encoded `id`. Components that need
 * to issue mutations (or build URLs that the backend filters by raw UUID) must
 * pass the decoded value.
 */
export function assetUuid(asset) {
  if (!asset) return null;
  if (asset.uuid) return asset.uuid;
  if (asset.id) return decodeId(asset.id);
  return null;
}

/**
 * Decode a relay node id if it looks base64-encoded; pass-through otherwise.
 *
 * Used by detail-page actions that receive an id from the route param: the
 * Searcher pushes `asset.id` (encoded), while form code may already hold the
 * decoded UUID.
 */
export function asUuid(rawOrEncoded) {
  if (!rawOrEncoded) return null;
  // A raw UUID contains hyphens; base64 ids do not.
  if (/-/.test(rawOrEncoded)) return rawOrEncoded;
  try {
    return decodeId(rawOrEncoded);
  } catch (_e) {
    return rawOrEncoded;
  }
}

/**
 * Short human label used in mutation labels / confirm titles.
 */
export function assetLabel(asset) {
  if (!asset) return '';
  return asset.serialNumber || asset.name || '';
}

/**
 * True when the assignee object refers to a real user.
 */
export function hasAssignee(asset) {
  return !!asset?.assignedTo?.id;
}
