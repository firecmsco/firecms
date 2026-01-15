import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const QueuePlayNextIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"queue_play_next"} ref={ref}/>
});

QueuePlayNextIcon.displayName = "QueuePlayNextIcon";
