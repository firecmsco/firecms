import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CarRentalIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"car_rental"} ref={ref}/>
});

CarRentalIcon.displayName = "CarRentalIcon";
