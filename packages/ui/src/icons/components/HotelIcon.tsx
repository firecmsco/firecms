import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HotelIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hotel"} ref={ref}/>
});

HotelIcon.displayName = "HotelIcon";
