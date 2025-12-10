import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ParkIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"park"} ref={ref}/>
});

ParkIcon.displayName = "ParkIcon";
