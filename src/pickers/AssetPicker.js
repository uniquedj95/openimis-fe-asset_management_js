import React, { useState } from 'react';
import { TextField } from '@material-ui/core';

import {
  Autocomplete, useModulesManager, useTranslations, useGraphqlQuery,
} from '@openimis/fe-core';

import { MODULE_NAME, PICKER_QUERY_LIMIT } from '../constants';

function AssetPicker(props) {
  const {
    multiple,
    required,
    label,
    nullLabel,
    withLabel = false,
    placeholder,
    withPlaceholder = false,
    readOnly,
    value,
    onChange,
    filter,
    filterSelectedOptions,
    // Optional caller-supplied filters merged into the query (e.g. status, deviceType).
    extraFilters,
  } = props;

  const modulesManager = useModulesManager();
  const [filters, setFilters] = useState({ isDeleted: false, ...(extraFilters || {}) });
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const { isLoading, data, error } = useGraphqlQuery(
    `
    query AssetPicker($search: String, $first: Int, $isDeleted: Boolean) {
      asset(search: $search, first: $first, isDeleted: $isDeleted, orderBy: "code") {
        edges {
          node {
            id
            uuid
            code
            name
            serialNumber
            deviceType
            status
          }
        }
      }
    }
    `,
    { ...filters, first: PICKER_QUERY_LIMIT },
    { skip: true },
  );

  const assets = data?.asset?.edges?.map((edge) => edge.node) ?? [];

  const optionLabel = (o) => (o ? `${o.code} ${o.name}${o.serialNumber ? ` (${o.serialNumber})` : ''}` : '');

  return (
    <Autocomplete
      multiple={multiple}
      error={error}
      readOnly={readOnly}
      options={assets}
      isLoading={isLoading}
      value={value}
      getOptionLabel={optionLabel}
      onChange={(v) => onChange(v, v ? optionLabel(v) : null)}
      filterOptions={filter}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={(search) => setFilters((prev) => ({ ...prev, search }))}
      renderInput={(inputProps) => (
        <TextField
          /* eslint-disable-next-line react/jsx-props-no-spreading */
          {...inputProps}
          required={required}
          label={(withLabel && (label || nullLabel)) || formatMessage('AssetPicker.label')}
          placeholder={(withPlaceholder && placeholder) || formatMessage('AssetPicker.placeholder')}
        />
      )}
    />
  );
}

export default AssetPicker;
