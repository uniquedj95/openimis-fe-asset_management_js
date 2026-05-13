import React from 'react';
import { Grid } from '@material-ui/core';
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from '@material-ui/core/styles';

import {
  TextInput, PublishedComponent, formatMessage, formatDateFromISO, withModulesManager,
} from '@openimis/fe-core';

import { MODULE_NAME } from '../constants';
import DeviceTypePicker from '../pickers/DeviceTypePicker';
import AssetStatusPicker from '../pickers/AssetStatusPicker';

const styles = (theme) => ({
  item: theme.paper.item,
  paper: theme.paper.paper,
  title: theme.paper.title,
  titleNum: theme.paper.titleNum,
});

/**
 * AssetMasterPanel
 *
 * Captures the editable identity fields of an asset: name, serial number,
 * device type, location. Status is displayed read-only — transitions are
 * driven by the detail-page action bar, not by directly editing the
 * status field.
 *
 * The component is rendered by the openIMIS `Form` helper, so it receives
 * `edited` / `onEditedChanged` / `readOnly` props.
 */
function AssetMasterPanel({
  intl, modulesManager, edited, onEditedChanged, readOnly, classes,
}) {
  const onChange = (field) => (value) => onEditedChanged({ ...edited, [field]: value });
  const fmtDate = (iso) => (iso ? formatDateFromISO(modulesManager, intl, iso) : '');

  const onPickerChange = (field) => (codeOrEntity) => {
    if (codeOrEntity && typeof codeOrEntity === 'object') {
      onEditedChanged({ ...edited, [field]: codeOrEntity });
    } else {
      onEditedChanged({
        ...edited,
        [field]: codeOrEntity ? { ...(edited?.[field] ?? {}), code: codeOrEntity } : null,
      });
    }
  };

  return (
    <div className={classes.paper}>
      <Grid container direction="row">
        <Grid item xs={4} className={classes.item}>
          <TextInput
            module={MODULE_NAME}
            label="asset.name"
            required
            readOnly={readOnly}
            value={edited?.name ?? ''}
            onChange={onChange('name')}
          />
        </Grid>
        <Grid item xs={4} className={classes.item}>
          <TextInput
            module={MODULE_NAME}
            label="asset.serialNumber"
            required
            readOnly={readOnly}
            value={edited?.serialNumber ?? ''}
            onChange={onChange('serialNumber')}
          />
        </Grid>
        <Grid item xs={4} className={classes.item}>
          <DeviceTypePicker
            required
            readOnly={readOnly}
            withNull={false}
            value={edited?.deviceType?.code ?? null}
            onChange={onPickerChange('deviceType')}
          />
        </Grid>
        <Grid item xs={4} className={classes.item}>
          <TextInput
            module={MODULE_NAME}
            label="asset.imei"
            readOnly={readOnly}
            value={edited?.imei ?? ''}
            onChange={onChange('imei')}
          />
        </Grid>
        <Grid item xs={4} className={classes.item}>
          <TextInput
            module={MODULE_NAME}
            label="asset.manufacturer"
            readOnly={readOnly}
            value={edited?.manufacturer ?? ''}
            onChange={onChange('manufacturer')}
          />
        </Grid>
        <Grid item xs={4} className={classes.item}>
          <TextInput
            module={MODULE_NAME}
            label="asset.model"
            readOnly={readOnly}
            value={edited?.model ?? ''}
            onChange={onChange('model')}
          />
        </Grid>
        <Grid item xs={4} className={classes.item}>
          <TextInput
            module={MODULE_NAME}
            label="asset.osVersion"
            readOnly={readOnly}
            value={edited?.osVersion ?? ''}
            onChange={onChange('osVersion')}
          />
        </Grid>
        <Grid item xs={4} className={classes.item}>
          <AssetStatusPicker
            readOnly
            withNull={false}
            value={edited?.status?.code ?? null}
          />
        </Grid>
        <Grid item xs={4} className={classes.item}>
          <PublishedComponent
            pubRef="location.LocationPicker"
            label={formatMessage(intl, MODULE_NAME, 'asset.location')}
            module={MODULE_NAME}
            required
            readOnly={readOnly}
            withNull={false}
            value={edited?.location ?? null}
            onChange={(location) => onEditedChanged({ ...edited, location })}
          />
        </Grid>
        {edited?.id && (
          <>
            <Grid item xs={4} className={classes.item}>
              <TextInput
                module={MODULE_NAME}
                label="asset.dateCreated"
                readOnly
                value={fmtDate(edited?.dateCreated)}
              />
            </Grid>
            <Grid item xs={4} className={classes.item}>
              <TextInput
                module={MODULE_NAME}
                label="asset.dateUpdated"
                readOnly
                value={fmtDate(edited?.dateUpdated)}
              />
            </Grid>
            <Grid item xs={4} className={classes.item}>
              <TextInput
                module={MODULE_NAME}
                label="asset.version"
                readOnly
                value={edited?.version != null ? String(edited.version) : ''}
              />
            </Grid>
          </>
        )}
      </Grid>
    </div>
  );
}

export default injectIntl(withModulesManager(withTheme(withStyles(styles)(AssetMasterPanel))));
