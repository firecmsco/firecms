import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SignalCellularAlt2BarIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"signal_cellular_alt_2_bar"} ref={ref}/>
});

SignalCellularAlt2BarIcon.displayName = "SignalCellularAlt2BarIcon";
