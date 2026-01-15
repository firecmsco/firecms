import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WomanIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"woman"} ref={ref}/>
});

WomanIcon.displayName = "WomanIcon";
