import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ShareArrivalTimeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"share_arrival_time"} ref={ref}/>
});

ShareArrivalTimeIcon.displayName = "ShareArrivalTimeIcon";
