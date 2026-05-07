import React from 'react';
import { ConstantBasedPicker } from '@openimis/fe-core';

import { DEVICE_TYPES, MODULE_NAME } from '../constants';

function DeviceTypePicker(props) {
  const {
    required,
    withNull = true,
    readOnly,
    onChange,
    value,
    nullLabel,
    withLabel,
    name = 'deviceType',
    filtered,
    reset,
  } = props;

  return (
    <ConstantBasedPicker
      module={MODULE_NAME}
      label="asset.deviceType"
      constants={DEVICE_TYPES}
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

export default DeviceTypePicker;
