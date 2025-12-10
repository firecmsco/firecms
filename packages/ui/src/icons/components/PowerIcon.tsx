import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PowerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"power"} ref={ref}/>
});

PowerIcon.displayName = "PowerIcon";
