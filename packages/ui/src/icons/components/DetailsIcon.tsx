import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DetailsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"details"} ref={ref}/>
});

DetailsIcon.displayName = "DetailsIcon";
