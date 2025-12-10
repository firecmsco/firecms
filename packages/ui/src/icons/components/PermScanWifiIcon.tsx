import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PermScanWifiIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"perm_scan_wifi"} ref={ref}/>
});

PermScanWifiIcon.displayName = "PermScanWifiIcon";
