import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SignalCellularAlt1BarIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"signal_cellular_alt_1_bar"} ref={ref}/>
});

SignalCellularAlt1BarIcon.displayName = "SignalCellularAlt1BarIcon";
