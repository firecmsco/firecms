import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DynamicFeedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"dynamic_feed"} ref={ref}/>
});

DynamicFeedIcon.displayName = "DynamicFeedIcon";
