import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HouseIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"house"} ref={ref}/>
});

HouseIcon.displayName = "HouseIcon";
