import React, { useMemo } from 'react';
import { injectIntl } from 'react-intl';
import { TextField } from '@material-ui/core';

import { Autocomplete, formatMessage, useModulesManager } from '@openimis/fe-core';

import { DEVICE_TYPES, MODULE_NAME } from '../constants';

/**
 * DeviceTypePicker
 *
 * Value semantics are unchanged — `onChange` is still called with the
 * raw device-type string (or null), so existing filter / form wiring
 * keeps working.
 */
function DeviceTypePicker({
  intl,
  onChange,
  value,
  readOnly,
  required,
  withLabel = true,
  withPlaceholder = false,
  label,
  placeholder,
  filtered,
}) {
  const modulesManager = useModulesManager();

  const options = useMemo(() => {
    const visible = filtered
      ? DEVICE_TYPES.filter((t) => !filtered.includes(t))
      : DEVICE_TYPES;
    return visible.map((t) => ({
      id: t,
      label: formatMessage(intl, MODULE_NAME, `asset.deviceType.${t}`),
    }));
  }, [filtered, intl]);

  const selected = useMemo(
    () => options.find((o) => o.id === value),
    [options, value],
  );

  const resolvedLabel = label ?? formatMessage(intl, MODULE_NAME, 'asset.deviceType');

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
      withPlaceholder={withPlaceholder}
      withLabel={withLabel}
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

export default injectIntl(DeviceTypePicker);
