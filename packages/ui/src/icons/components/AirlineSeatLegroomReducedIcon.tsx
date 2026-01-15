import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AirlineSeatLegroomReducedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"airline_seat_legroom_reduced"} ref={ref}/>
});

AirlineSeatLegroomReducedIcon.displayName = "AirlineSeatLegroomReducedIcon";
