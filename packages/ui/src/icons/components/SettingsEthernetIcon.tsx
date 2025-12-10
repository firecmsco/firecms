import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SettingsEthernetIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"settings_ethernet"} ref={ref}/>
});

SettingsEthernetIcon.displayName = "SettingsEthernetIcon";
