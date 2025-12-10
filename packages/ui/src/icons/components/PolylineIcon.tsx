import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PolylineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"polyline"} ref={ref}/>
});

PolylineIcon.displayName = "PolylineIcon";
