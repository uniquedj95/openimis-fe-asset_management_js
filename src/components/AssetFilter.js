import React from 'react';
import { injectIntl } from 'react-intl';
import { Grid, FormControlLabel, Checkbox } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import _debounce from 'lodash/debounce';

import {
  TextInput, PublishedComponent, formatMessage, useModulesManager,
} from '@openimis/fe-core';

import {
  CONTAINS_LOOKUP,
  DEFAULT_DEBOUNCE_TIME,
  EMPTY_STRING,
  MODULE_NAME,
} from '../constants';
import { defaultFilterStyles } from '../util/styles';
import DeviceTypePicker from '../pickers/DeviceTypePicker';
import AssetStatusPicker from '../pickers/AssetStatusPicker';

function AssetFilter({
  intl, classes, filters, onChangeFilters,
}) {
  const modulesManager = useModulesManager();
  const debouncedOnChangeFilters = _debounce(onChangeFilters, DEFAULT_DEBOUNCE_TIME);

  const filterValue = (name) => filters?.[name]?.value;
  const filterTextFieldValue = (name) => filters?.[name]?.value ?? EMPTY_STRING;

  const onChangeStringFilter = (name, lookup = null) => (value) => {
    const fragment = lookup
      ? `${name}_${lookup}: "${value}"`
      : `${name}: "${value}"`;
    debouncedOnChangeFilters([{ id: name, value, filter: fragment }]);
  };

  const onChangeEnumFilter = (name) => (value) => {
    onChangeFilters([
      {
        id: name,
        value,
        // null clears the filter; otherwise emit unquoted enum literal.
        filter: value ? `${name}: ${value}` : null,
      },
    ]);
  };

  const onChangeUuidFilter = (name) => (uuid) => {
    onChangeFilters([
      {
        id: name,
        value: uuid,
        filter: uuid ? `${name}: "${uuid}"` : null,
      },
    ]);
  };

  const onChangeCheckbox = (name) => (event) => {
    const value = event.target.checked;
    onChangeFilters([{ id: name, value, filter: `${name}: ${value}` }]);
  };

  return (
    <Grid container className={classes.form}>
      <Grid item xs={2} className={classes.item}>
        <TextInput
          module={MODULE_NAME}
          label="asset.code"
          value={filterTextFieldValue('code')}
          onChange={onChangeStringFilter('code', CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid item xs={2} className={classes.item}>
        <TextInput
          module={MODULE_NAME}
          label="asset.name"
          value={filterTextFieldValue('name')}
          onChange={onChangeStringFilter('name', CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid item xs={2} className={classes.item}>
        <TextInput
          module={MODULE_NAME}
          label="asset.serialNumber"
          value={filterTextFieldValue('serialNumber')}
          onChange={onChangeStringFilter('serialNumber', CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid item xs={2} className={classes.item}>
        <DeviceTypePicker
          withNull
          nullLabel={formatMessage(intl, MODULE_NAME, 'any')}
          value={filterValue('deviceType')}
          onChange={onChangeEnumFilter('deviceType')}
        />
      </Grid>
      <Grid item xs={2} className={classes.item}>
        <AssetStatusPicker
          withNull
          nullLabel={formatMessage(intl, MODULE_NAME, 'any')}
          value={filterValue('status')}
          onChange={onChangeEnumFilter('status')}
        />
      </Grid>
      {modulesManager.getRef('location.LocationPicker') && (
        <Grid item xs={2} className={classes.item}>
          <PublishedComponent
            pubRef="location.LocationPicker"
            label={formatMessage(intl, MODULE_NAME, 'asset.location')}
            withNull
            value={filterValue('location')}
            onChange={(loc) => onChangeUuidFilter('location_Uuid')(loc?.uuid ?? null)}
          />
        </Grid>
      )}
      {modulesManager.getRef('admin.UserPicker') && (
        <Grid item xs={2} className={classes.item}>
          <PublishedComponent
            pubRef="admin.UserPicker"
            module={MODULE_NAME}
            label={formatMessage(intl, MODULE_NAME, 'asset.assignedTo')}
            withNull
            value={filterValue('assignedTo')}
            onChange={(user) => onChangeUuidFilter('assignedTo_Uuid')(user?.uuid ?? null)}
          />
        </Grid>
      )}
      <Grid item xs={2} className={classes.item}>
        <FormControlLabel
          control={(
            <Checkbox
              color="primary"
              checked={!!filterValue('isDeleted')}
              onChange={onChangeCheckbox('isDeleted')}
            />
          )}
          label={formatMessage(intl, MODULE_NAME, 'asset.isDeleted')}
        />
      </Grid>
    </Grid>
  );
}

export default injectIntl(withTheme(withStyles(defaultFilterStyles)(AssetFilter)));
