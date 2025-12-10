import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StadiumIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"stadium"} ref={ref}/>
});

StadiumIcon.displayName = "StadiumIcon";
