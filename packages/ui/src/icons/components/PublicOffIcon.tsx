import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PublicOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"public_off"} ref={ref}/>
});

PublicOffIcon.displayName = "PublicOffIcon";
