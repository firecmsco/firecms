import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AddToQueueIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"add_to_queue"} ref={ref}/>
});

AddToQueueIcon.displayName = "AddToQueueIcon";
