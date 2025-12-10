import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TopicIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"topic"} ref={ref}/>
});

TopicIcon.displayName = "TopicIcon";
