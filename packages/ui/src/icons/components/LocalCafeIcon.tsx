import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocalCafeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"local_cafe"} ref={ref}/>
});

LocalCafeIcon.displayName = "LocalCafeIcon";
