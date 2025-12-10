import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EMobiledataIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"e_mobiledata"} ref={ref}/>
});

EMobiledataIcon.displayName = "EMobiledataIcon";
