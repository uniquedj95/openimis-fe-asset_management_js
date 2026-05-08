import { graphql, formatPageQueryWithCount } from '@openimis/fe-core';

import { ACTION_TYPE } from './reducer';
import { ASSET_PROJECTION } from './constants';

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
