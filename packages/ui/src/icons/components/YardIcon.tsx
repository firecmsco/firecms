import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const YardIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"yard"} ref={ref}/>
});

YardIcon.displayName = "YardIcon";
