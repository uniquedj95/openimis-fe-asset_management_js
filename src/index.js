// Disable due to core architecture
/* eslint-disable camelcase */
/* eslint-disable import/prefer-default-export */
import React from 'react';
import { Devices } from '@material-ui/icons';
import flatten from 'flat';
import { FormattedMessage } from '@openimis/fe-core';
import messages_en from './translations/en.json';
import reducer from './reducer';
import AssetMainMenu from './menus/AssetMainMenu';
import DeviceTypePicker from './pickers/DeviceTypePicker';
import AssetStatusPicker from './pickers/AssetStatusPicker';
import AssignmentActionPicker from './pickers/AssignmentActionPicker';
import AssetPicker from './pickers/AssetPicker';
import AssetIcon from './displays/AssetIcon';
import AssetsPage from './pages/AssetsPage';
import AssetPage from './pages/AssetPage';
import {
  MODULE_NAME,
  ROUTE_ASSETS,
  ROUTE_ASSET,
  ROUTE_ASSET_HISTORY,
  RIGHT_ASSET_SEARCH,
} from './constants';

const DEFAULT_CONFIG = {
  translations: [{ key: 'en', messages: flatten(messages_en) }],
  reducers: [{ key: MODULE_NAME, reducer }],
  'core.MainMenu': [{ name: 'AssetMainMenu', component: AssetMainMenu }],
  'assetManagement.MainMenu': [
    {
      id: 'assetManagement.assets',
      text: <FormattedMessage module="assetManagement" id="menu.assets" />,
      icon: <Devices />,
      route: `/${ROUTE_ASSETS}`,
      filter: (rights) => rights.includes(RIGHT_ASSET_SEARCH),
    },
  ],
  'core.Router': [
    { path: ROUTE_ASSETS, component: AssetsPage },
    { path: `${ROUTE_ASSET}/:asset_uuid?`, component: AssetPage },
  ],
  refs: [
    { key: 'assetManagement.route.assets', ref: ROUTE_ASSETS },
    { key: 'assetManagement.route.asset', ref: ROUTE_ASSET },
    { key: 'assetManagement.route.assetHistory', ref: ROUTE_ASSET_HISTORY },
    { key: 'assetManagement.DeviceTypePicker', ref: DeviceTypePicker },
    { key: 'assetManagement.AssetStatusPicker', ref: AssetStatusPicker },
    { key: 'assetManagement.AssignmentActionPicker', ref: AssignmentActionPicker },
    { key: 'assetManagement.AssetPicker', ref: AssetPicker },
    { key: 'assetManagement.AssetIcon', ref: AssetIcon },
  ],
};

export const AssetManagementModule = (cfg) => ({ ...DEFAULT_CONFIG, ...cfg });
