import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RawOnIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"raw_on"} ref={ref}/>
});

RawOnIcon.displayName = "RawOnIcon";
