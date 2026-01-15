import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DesignServicesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"design_services"} ref={ref}/>
});

DesignServicesIcon.displayName = "DesignServicesIcon";
