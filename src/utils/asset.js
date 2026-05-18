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
