import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FlagCircleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"flag_circle"} ref={ref}/>
});

FlagCircleIcon.displayName = "FlagCircleIcon";
