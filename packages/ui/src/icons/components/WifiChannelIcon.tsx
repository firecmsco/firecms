import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WifiChannelIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wifi_channel"} ref={ref}/>
});

WifiChannelIcon.displayName = "WifiChannelIcon";
