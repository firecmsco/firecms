import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocationDisabledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"location_disabled"} ref={ref}/>
});

LocationDisabledIcon.displayName = "LocationDisabledIcon";
