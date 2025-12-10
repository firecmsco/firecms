import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SignalCellular0BarIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"signal_cellular_0_bar"} ref={ref}/>
});

SignalCellular0BarIcon.displayName = "SignalCellular0BarIcon";
