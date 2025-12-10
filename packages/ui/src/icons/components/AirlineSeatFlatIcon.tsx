import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AirlineSeatFlatIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"airline_seat_flat"} ref={ref}/>
});

AirlineSeatFlatIcon.displayName = "AirlineSeatFlatIcon";
