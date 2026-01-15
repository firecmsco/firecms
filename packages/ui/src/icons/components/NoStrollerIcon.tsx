import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NoStrollerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"no_stroller"} ref={ref}/>
});

NoStrollerIcon.displayName = "NoStrollerIcon";
