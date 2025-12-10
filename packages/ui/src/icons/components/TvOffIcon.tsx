import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TvOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"tv_off"} ref={ref}/>
});

TvOffIcon.displayName = "TvOffIcon";
