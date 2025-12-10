import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RocketIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"rocket"} ref={ref}/>
});

RocketIcon.displayName = "RocketIcon";
