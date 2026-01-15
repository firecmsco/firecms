import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EcoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"eco"} ref={ref}/>
});

EcoIcon.displayName = "EcoIcon";
