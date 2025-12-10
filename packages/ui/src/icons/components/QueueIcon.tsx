import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const QueueIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"queue"} ref={ref}/>
});

QueueIcon.displayName = "QueueIcon";
