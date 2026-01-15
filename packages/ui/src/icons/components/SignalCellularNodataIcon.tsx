import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SignalCellularNodataIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"signal_cellular_nodata"} ref={ref}/>
});

SignalCellularNodataIcon.displayName = "SignalCellularNodataIcon";
