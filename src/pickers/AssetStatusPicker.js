import React, { useMemo } from 'react';
import { injectIntl } from 'react-intl';
import { TextField } from '@material-ui/core';

import { Autocomplete, formatMessage, useModulesManager } from '@openimis/fe-core';

import { ASSET_STATUS_LIST, MODULE_NAME } from '../constants';
import { getAllowedTransitions } from '../utils/statusFsm';

/**
 * AssetStatusPicker.
 *
 * Supports the same FSM-aware filtering as before:
 *   - `restrictTo`: explicit array of statuses to keep
 *   - `fromStatus`: keep only statuses reachable by `getAllowedTransitions`
 */
function AssetStatusPicker({
  intl,
  onChange,
  value,
  readOnly,
  required,
  withLabel = true,
  withPlaceholder = false,
  label,
  placeholder,
  fromStatus,
  restrictTo,
}) {
  const modulesManager = useModulesManager();

  const options = useMemo(() => {
    let visible = ASSET_STATUS_LIST;
    if (Array.isArray(restrictTo)) {
      visible = ASSET_STATUS_LIST.filter((s) => restrictTo.includes(s));
    } else if (fromStatus) {
      const allowed = getAllowedTransitions(fromStatus);
      visible = ASSET_STATUS_LIST.filter((s) => allowed.includes(s));
    }
    return visible.map((s) => ({
      id: s,
      label: formatMessage(intl, MODULE_NAME, `asset.status.${s}`),
    }));
  }, [restrictTo, fromStatus, intl]);

  const selected = useMemo(
    () => options.find((o) => o.id === value),
    [options, value],
  );

  const resolvedLabel = label ?? formatMessage(intl, MODULE_NAME, 'asset.status');

  return (
    <Autocomplete
      modulesManager={modulesManager}
      options={options}
      value={selected}
      openOnFocus
      getOptionLabel={(opt) => opt?.label ?? ''}
      onChange={(opt) => onChange(opt?.id ?? null)}
      onInputChange={() => {}}
      readOnly={readOnly}
      required={required}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      label={resolvedLabel}
      placeholder={placeholder}
      renderInput={(inputProps) => (
        <TextField
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...inputProps}
          variant="standard"
          required={required}
          label={withLabel ? resolvedLabel : undefined}
          placeholder={!readOnly && withPlaceholder ? placeholder : undefined}
        />
      )}
    />
  );
}

export default injectIntl(AssetStatusPicker);
