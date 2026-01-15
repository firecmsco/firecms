import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LinkIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"link"} ref={ref}/>
});

LinkIcon.displayName = "LinkIcon";
