import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const OpenInNewIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"open_in_new"} ref={ref}/>
});

OpenInNewIcon.displayName = "OpenInNewIcon";
