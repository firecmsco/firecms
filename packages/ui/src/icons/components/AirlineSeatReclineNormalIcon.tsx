import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AirlineSeatReclineNormalIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"airline_seat_recline_normal"} ref={ref}/>
});

AirlineSeatReclineNormalIcon.displayName = "AirlineSeatReclineNormalIcon";
