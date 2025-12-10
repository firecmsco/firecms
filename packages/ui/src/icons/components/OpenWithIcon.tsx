import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const OpenWithIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"open_with"} ref={ref}/>
});

OpenWithIcon.displayName = "OpenWithIcon";
