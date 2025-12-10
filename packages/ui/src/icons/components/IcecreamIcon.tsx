import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const IcecreamIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"icecream"} ref={ref}/>
});

IcecreamIcon.displayName = "IcecreamIcon";
