import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MobileOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mobile_off"} ref={ref}/>
});

MobileOffIcon.displayName = "MobileOffIcon";
