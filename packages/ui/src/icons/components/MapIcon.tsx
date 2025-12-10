import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MapIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"map"} ref={ref}/>
});

MapIcon.displayName = "MapIcon";
