import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HdrOnIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hdr_on"} ref={ref}/>
});

HdrOnIcon.displayName = "HdrOnIcon";
