import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LooksTwoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"looks_two"} ref={ref}/>
});

LooksTwoIcon.displayName = "LooksTwoIcon";
