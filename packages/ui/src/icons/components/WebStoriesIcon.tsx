import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WebStoriesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"web_stories"} ref={ref}/>
});

WebStoriesIcon.displayName = "WebStoriesIcon";
