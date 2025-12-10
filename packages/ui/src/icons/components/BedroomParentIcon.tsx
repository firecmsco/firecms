import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BedroomParentIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bedroom_parent"} ref={ref}/>
});

BedroomParentIcon.displayName = "BedroomParentIcon";
