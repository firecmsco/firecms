import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MovingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"moving"} ref={ref}/>
});

MovingIcon.displayName = "MovingIcon";
