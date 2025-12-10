import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WifiTetheringErrorRoundedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wifi_tethering_error_rounded"} ref={ref}/>
});

WifiTetheringErrorRoundedIcon.displayName = "WifiTetheringErrorRoundedIcon";
