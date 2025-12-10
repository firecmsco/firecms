import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AirlineSeatReclineExtraIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"airline_seat_recline_extra"} ref={ref}/>
});

AirlineSeatReclineExtraIcon.displayName = "AirlineSeatReclineExtraIcon";
