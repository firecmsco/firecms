import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HotelClassIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hotel_class"} ref={ref}/>
});

HotelClassIcon.displayName = "HotelClassIcon";
