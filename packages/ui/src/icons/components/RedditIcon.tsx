import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RedditIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"reddit"} ref={ref}/>
});

RedditIcon.displayName = "RedditIcon";
