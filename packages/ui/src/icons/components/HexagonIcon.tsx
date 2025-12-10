import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HexagonIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hexagon"} ref={ref}/>
});

HexagonIcon.displayName = "HexagonIcon";
