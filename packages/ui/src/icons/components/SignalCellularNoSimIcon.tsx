import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SignalCellularNoSimIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"signal_cellular_no_sim"} ref={ref}/>
});

SignalCellularNoSimIcon.displayName = "SignalCellularNoSimIcon";
