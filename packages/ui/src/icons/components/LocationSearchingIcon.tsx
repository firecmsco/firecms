import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocationSearchingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"location_searching"} ref={ref}/>
});

LocationSearchingIcon.displayName = "LocationSearchingIcon";
