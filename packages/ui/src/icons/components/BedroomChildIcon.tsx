import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BedroomChildIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bedroom_child"} ref={ref}/>
});

BedroomChildIcon.displayName = "BedroomChildIcon";
