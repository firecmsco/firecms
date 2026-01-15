import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SignalCellularNullIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"signal_cellular_null"} ref={ref}/>
});

SignalCellularNullIcon.displayName = "SignalCellularNullIcon";
