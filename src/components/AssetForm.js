import React from 'react';
import clsx from 'clsx';
import ReplayIcon from '@material-ui/icons/Replay';
import { makeStyles } from '@material-ui/styles';

import { Form, ProgressOrError } from '@openimis/fe-core';

import { MODULE_NAME } from '../constants';
import AssetMasterPanel from './AssetMasterPanel';
import AssetAssignmentPanel from './AssetAssignmentPanel';
import AssetActionBar from './AssetActionBar';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  locked: theme.page?.locked,
}));

/**
 * AssetForm — composes the detail panels under the openIMIS `Form`
 * helper, with the action bar rendered above the panels so it's always
 * visible. Save / Cancel / Reset are owned by the `Form` helper; the action
 * bar handles transitions and delete.
 */
function AssetForm({
  edited, asset, readOnly, error, fetchingAsset,
  onChange, onSave, onBack, onReset, canSave,
}) {
  const classes = useStyles();
  const isEdit = !!(asset?.id || asset?.uuid);
  const titleKey = isEdit ? 'assetPage.title.edit' : 'assetPage.title.create';

  return (
    <div className={clsx(classes.page, readOnly && classes.locked)}>
      <ProgressOrError progress={fetchingAsset} error={error} />
      {isEdit && <AssetActionBar edited={edited ?? asset} />}
      <Form
        module={MODULE_NAME}
        title={titleKey}
        titleParams={{
          serialNumber: edited?.serialNumber ?? asset?.serialNumber ?? '',
          name: edited?.name ?? asset?.name ?? '',
        }}
        readOnly={readOnly}
        edited={edited}
        edited_id={edited?.uuid ?? edited?.id}
        canSave={canSave}
        onEditedChanged={onChange}
        HeadPanel={AssetMasterPanel}
        Panels={[
          ...(isEdit ? [AssetAssignmentPanel] : []),
        ]}
        save={onSave}
        back={onBack}
        openDirty={onSave}
        actions={[
          { doIt: onReset, icon: <ReplayIcon />, onlyIfDirty: !readOnly },
        ]}
      />
    </div>
  );
}

export default AssetForm;
