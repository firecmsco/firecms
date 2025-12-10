import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MobiledataOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mobiledata_off"} ref={ref}/>
});

MobiledataOffIcon.displayName = "MobiledataOffIcon";
