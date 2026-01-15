import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FeedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"feed"} ref={ref}/>
});

FeedIcon.displayName = "FeedIcon";
