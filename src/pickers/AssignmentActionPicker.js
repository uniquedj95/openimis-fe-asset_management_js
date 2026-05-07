import React from 'react';
import { ConstantBasedPicker } from '@openimis/fe-core';

import { ASSIGNMENT_ACTION_LIST, MODULE_NAME } from '../constants';

function AssignmentActionPicker(props) {
  const {
    required,
    withNull = true,
    readOnly,
    onChange,
    value,
    nullLabel,
    withLabel,
    name = 'action',
    filtered,
    reset,
  } = props;

  return (
    <ConstantBasedPicker
      module={MODULE_NAME}
      label="asset.action"
      constants={ASSIGNMENT_ACTION_LIST}
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

export default AssignmentActionPicker;
