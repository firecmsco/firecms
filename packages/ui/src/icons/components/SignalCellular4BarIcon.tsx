import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SignalCellular4BarIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"signal_cellular_4_bar"} ref={ref}/>
});

SignalCellular4BarIcon.displayName = "SignalCellular4BarIcon";
