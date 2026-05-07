import React from 'react';
import PhoneAndroidIcon from '@material-ui/icons/PhoneAndroid';
import TabletAndroidIcon from '@material-ui/icons/TabletAndroid';
import DevicesIcon from '@material-ui/icons/Devices';

import { DEVICE_TYPE } from '../constants';

const ICON_MAP = {
  [DEVICE_TYPE.PHONE]: PhoneAndroidIcon,
  [DEVICE_TYPE.TABLET]: TabletAndroidIcon,
};

/**
 * Renders a device-type icon. Falls back to a generic devices icon for
 * unknown / null types. All Material-UI `SvgIcon` props (fontSize, color,
 * className, …) are forwarded.
 */
function AssetIcon(props) {
  const { deviceType, ...rest } = props;
  const Icon = ICON_MAP[deviceType] ?? DevicesIcon;
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Icon {...rest} />;
}

export default AssetIcon;
