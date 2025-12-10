import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AirlineSeatFlatAngledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"airline_seat_flat_angled"} ref={ref}/>
});

AirlineSeatFlatAngledIcon.displayName = "AirlineSeatFlatAngledIcon";
