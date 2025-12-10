import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CloudQueueIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"cloud_queue"} ref={ref}/>
});

CloudQueueIcon.displayName = "CloudQueueIcon";
