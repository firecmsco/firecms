import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SnowshoeingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"snowshoeing"} ref={ref}/>
});

SnowshoeingIcon.displayName = "SnowshoeingIcon";
