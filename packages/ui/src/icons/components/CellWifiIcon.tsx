import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CellWifiIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"cell_wifi"} ref={ref}/>
});

CellWifiIcon.displayName = "CellWifiIcon";
