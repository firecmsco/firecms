import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ApiIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"api"} ref={ref}/>
});

ApiIcon.displayName = "ApiIcon";
