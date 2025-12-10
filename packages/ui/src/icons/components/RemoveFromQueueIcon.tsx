import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RemoveFromQueueIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"remove_from_queue"} ref={ref}/>
});

RemoveFromQueueIcon.displayName = "RemoveFromQueueIcon";
