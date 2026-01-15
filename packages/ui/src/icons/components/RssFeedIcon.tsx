import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RssFeedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"rss_feed"} ref={ref}/>
});

RssFeedIcon.displayName = "RssFeedIcon";
