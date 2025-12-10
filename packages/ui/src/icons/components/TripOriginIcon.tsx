import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TripOriginIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"trip_origin"} ref={ref}/>
});

TripOriginIcon.displayName = "TripOriginIcon";
