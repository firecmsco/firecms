import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocalHotelIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"local_hotel"} ref={ref}/>
});

LocalHotelIcon.displayName = "LocalHotelIcon";
