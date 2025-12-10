import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocationCityIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"location_city"} ref={ref}/>
});

LocationCityIcon.displayName = "LocationCityIcon";
