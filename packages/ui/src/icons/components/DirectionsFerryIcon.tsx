import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DirectionsFerryIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"directions_ferry"} ref={ref}/>
});

DirectionsFerryIcon.displayName = "DirectionsFerryIcon";
