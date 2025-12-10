import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GMobiledataIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"g_mobiledata"} ref={ref}/>
});

GMobiledataIcon.displayName = "GMobiledataIcon";
