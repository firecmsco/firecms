import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HvacIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hvac"} ref={ref}/>
});

HvacIcon.displayName = "HvacIcon";
