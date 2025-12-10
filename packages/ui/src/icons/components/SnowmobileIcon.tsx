import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SnowmobileIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"snowmobile"} ref={ref}/>
});

SnowmobileIcon.displayName = "SnowmobileIcon";
