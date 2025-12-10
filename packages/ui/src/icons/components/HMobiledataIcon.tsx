import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HMobiledataIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"h_mobiledata"} ref={ref}/>
});

HMobiledataIcon.displayName = "HMobiledataIcon";
