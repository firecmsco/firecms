import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HomeRepairServiceIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"home_repair_service"} ref={ref}/>
});

HomeRepairServiceIcon.displayName = "HomeRepairServiceIcon";
