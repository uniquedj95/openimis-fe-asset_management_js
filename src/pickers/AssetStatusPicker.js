import React from 'react';
import { ConstantBasedPicker } from '@openimis/fe-core';

import { ASSET_STATUS_LIST, MODULE_NAME } from '../constants';
import { getAllowedTransitions } from '../utils/statusFsm';

function AssetStatusPicker(props) {
  const {
    required,
    withNull = true,
    readOnly,
    onChange,
    value,
    nullLabel,
    withLabel,
    name = 'status',
    reset,
    // FSM-aware filtering: when provided, only allowed transition targets are selectable.
    fromStatus,
    // Explicit override (e.g. show only a subset). Wins over `fromStatus`.
    restrictTo,
  } = props;

  let filtered;
  if (Array.isArray(restrictTo)) {
    filtered = ASSET_STATUS_LIST.filter((s) => !restrictTo.includes(s));
  } else if (fromStatus) {
    const allowed = getAllowedTransitions(fromStatus);
    filtered = ASSET_STATUS_LIST.filter((s) => !allowed.includes(s));
  }

  return (
    <ConstantBasedPicker
      module={MODULE_NAME}
      label="asset.status"
      constants={ASSET_STATUS_LIST}
      required={required}
      withNull={withNull}
      readOnly={readOnly}
      onChange={onChange}
      value={value}
      nullLabel={nullLabel}
      withLabel={withLabel}
      name={name}
      filtered={filtered}
      reset={reset}
    />
  );
}

export default AssetStatusPicker;
