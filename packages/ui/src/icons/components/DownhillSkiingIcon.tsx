import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DownhillSkiingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"downhill_skiing"} ref={ref}/>
});

DownhillSkiingIcon.displayName = "DownhillSkiingIcon";
