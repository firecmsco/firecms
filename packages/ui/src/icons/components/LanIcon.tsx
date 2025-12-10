import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LanIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"lan"} ref={ref}/>
});

LanIcon.displayName = "LanIcon";
