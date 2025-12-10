import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PowerInputIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"power_input"} ref={ref}/>
});

PowerInputIcon.displayName = "PowerInputIcon";
