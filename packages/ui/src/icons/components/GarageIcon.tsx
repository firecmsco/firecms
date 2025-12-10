import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GarageIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"garage"} ref={ref}/>
});

GarageIcon.displayName = "GarageIcon";
