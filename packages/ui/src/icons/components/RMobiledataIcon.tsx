import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RMobiledataIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"r_mobiledata"} ref={ref}/>
});

RMobiledataIcon.displayName = "RMobiledataIcon";
