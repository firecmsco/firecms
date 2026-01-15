import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocalLaundryServiceIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"local_laundry_service"} ref={ref}/>
});

LocalLaundryServiceIcon.displayName = "LocalLaundryServiceIcon";
