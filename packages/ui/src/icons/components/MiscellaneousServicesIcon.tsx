import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MiscellaneousServicesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"miscellaneous_services"} ref={ref}/>
});

MiscellaneousServicesIcon.displayName = "MiscellaneousServicesIcon";
