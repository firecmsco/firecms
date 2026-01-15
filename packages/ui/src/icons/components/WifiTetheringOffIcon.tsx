import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WifiTetheringOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wifi_tethering_off"} ref={ref}/>
});

WifiTetheringOffIcon.displayName = "WifiTetheringOffIcon";
