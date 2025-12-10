import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PlumbingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"plumbing"} ref={ref}/>
});

PlumbingIcon.displayName = "PlumbingIcon";
