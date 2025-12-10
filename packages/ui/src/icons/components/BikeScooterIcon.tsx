import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BikeScooterIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bike_scooter"} ref={ref}/>
});

BikeScooterIcon.displayName = "BikeScooterIcon";
