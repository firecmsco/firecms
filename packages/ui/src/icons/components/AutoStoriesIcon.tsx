import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AutoStoriesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"auto_stories"} ref={ref}/>
});

AutoStoriesIcon.displayName = "AutoStoriesIcon";
