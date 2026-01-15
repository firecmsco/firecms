import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LinkOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"link_off"} ref={ref}/>
});

LinkOffIcon.displayName = "LinkOffIcon";
