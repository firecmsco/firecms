import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MovieIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"movie"} ref={ref}/>
});

MovieIcon.displayName = "MovieIcon";
