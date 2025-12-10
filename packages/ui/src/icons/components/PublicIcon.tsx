import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PublicIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"public"} ref={ref}/>
});

PublicIcon.displayName = "PublicIcon";
