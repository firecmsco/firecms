import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CircleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"circle"} ref={ref}/>
});

CircleIcon.displayName = "CircleIcon";
