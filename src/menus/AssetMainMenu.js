/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Devices } from '@material-ui/icons';
import { formatMessage, MainMenuContribution, withModulesManager } from '@openimis/fe-core';
import {
  RIGHT_ASSET_SEARCH,
  ASSET_MANAGEMENT_MAIN_MENU_CONTRIBUTION_KEY,
  ROUTE_ASSETS,
} from '../constants';

function AssetMainMenu(props) {
  const entries = [
    {
      text: formatMessage(props.intl, 'assetManagement', 'menu.assets'),
      icon: <Devices />,
      route: `/${ROUTE_ASSETS}`,
      filter: (rights) => rights.includes(RIGHT_ASSET_SEARCH),
      id: 'assetManagement.assets',
    },
  ];
  entries.push(
    ...props.modulesManager
      .getContribs(ASSET_MANAGEMENT_MAIN_MENU_CONTRIBUTION_KEY)
      .filter((c) => !c.filter || c.filter(props.rights)),
  );

  return (
    <MainMenuContribution
      {...props}
      header={formatMessage(props.intl, 'assetManagement', 'mainMenu')}
      entries={entries}
      menuId="AssetMainMenu"
    />
  );
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export default injectIntl(withModulesManager(connect(mapStateToProps)(AssetMainMenu)));
