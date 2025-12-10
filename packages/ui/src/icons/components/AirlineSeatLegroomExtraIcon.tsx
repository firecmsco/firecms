import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AirlineSeatLegroomExtraIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"airline_seat_legroom_extra"} ref={ref}/>
});

AirlineSeatLegroomExtraIcon.displayName = "AirlineSeatLegroomExtraIcon";
