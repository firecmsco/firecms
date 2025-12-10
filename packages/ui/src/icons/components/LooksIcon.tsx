import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LooksIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"looks"} ref={ref}/>
});

LooksIcon.displayName = "LooksIcon";
