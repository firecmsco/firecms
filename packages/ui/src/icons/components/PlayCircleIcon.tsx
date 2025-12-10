import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PlayCircleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"play_circle"} ref={ref}/>
});

PlayCircleIcon.displayName = "PlayCircleIcon";
