import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AirlineSeatLegroomNormalIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"airline_seat_legroom_normal"} ref={ref}/>
});

AirlineSeatLegroomNormalIcon.displayName = "AirlineSeatLegroomNormalIcon";
