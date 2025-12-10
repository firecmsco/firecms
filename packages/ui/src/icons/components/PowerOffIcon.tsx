import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PowerOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"power_off"} ref={ref}/>
});

PowerOffIcon.displayName = "PowerOffIcon";
