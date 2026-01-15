import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DevicesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"devices"} ref={ref}/>
});

DevicesIcon.displayName = "DevicesIcon";
