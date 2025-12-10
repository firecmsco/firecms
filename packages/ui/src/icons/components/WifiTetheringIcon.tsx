import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WifiTetheringIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wifi_tethering"} ref={ref}/>
});

WifiTetheringIcon.displayName = "WifiTetheringIcon";
