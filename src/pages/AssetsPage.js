import React, { useEffect } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
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
  coreAlert,
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
    intl, classes, rights, modulesManager, history, coreAlert,
  } = props;

  // Redirect unauthorized users to home with error toast
  useEffect(() => {
    // Wait for rights to load (non-empty array)
    if (rights.length > 0 && !rights.includes(RIGHT_ASSET_SEARCH)) {
      coreAlert(
        formatMessage(intl, MODULE_NAME, 'error.insufficientRights'),
        formatMessage(intl, MODULE_NAME, 'assetsPage.title'),
      );
      historyPush(modulesManager, history, 'home');
    }
  }, [rights]);

  // Show nothing while auth is loading
  if (rights.length === 0 || !rights.includes(RIGHT_ASSET_SEARCH)) return null;

  const onAdd = () => historyPush(modulesManager, history, 'assetManagement.route.asset');

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage(intl, MODULE_NAME, 'assetsPage.helmet')} />
      <AssetSearcher rights={rights} />
      {rights.includes(RIGHT_ASSET_CREATE) && withTooltip(
        <div className={classes.fab}>
          <Fab
            color="primary"
            onClick={onAdd}
            aria-label={formatMessage(intl, MODULE_NAME, 'assetsPage.newAsset.tooltip')}
          >
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

const mapDispatchToProps = (dispatch) => bindActionCreators({
  coreAlert,
}, dispatch);

export default withModulesManager(
  withHistory(
    injectIntl(
      withTheme(
        withStyles(styles)(
          connect(mapStateToProps, mapDispatchToProps)(AssetsPage),
        ),
      ),
    ),
  ),
);
