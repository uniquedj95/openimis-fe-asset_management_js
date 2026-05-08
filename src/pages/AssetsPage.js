import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import {
  Helmet,
  withModulesManager,
  withHistory,
  historyPush,
  formatMessage,
  withTooltip,
} from '@openimis/fe-core';

import {
  MODULE_NAME,
  RIGHT_ASSET_SEARCH,
  RIGHT_ASSET_CREATE,
} from '../constants';
import AssetSearcher from '../components/AssetSearcher';

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab,
});

function AssetsPage(props) {
  const {
    intl, classes, rights, modulesManager, history,
  } = props;

  if (!rights.includes(RIGHT_ASSET_SEARCH)) return null;

  const onAdd = () => historyPush(modulesManager, history, 'assetManagement.route.asset');

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage(intl, MODULE_NAME, 'assetsPage.helmet')} />
      <AssetSearcher rights={rights} />
      {rights.includes(RIGHT_ASSET_CREATE) && withTooltip(
        <div className={classes.fab}>
          <Fab color="primary" onClick={onAdd}>
            <AddIcon />
          </Fab>
        </div>,
        formatMessage(intl, MODULE_NAME, 'assetsPage.newAsset.tooltip'),
      )}
    </div>
  );
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
});

export default withModulesManager(
  withHistory(
    injectIntl(
      withTheme(
        withStyles(styles)(
          connect(mapStateToProps)(AssetsPage),
        ),
      ),
    ),
  ),
);
