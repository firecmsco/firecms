import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PlayCircleOutlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"play_circle_outline"} ref={ref}/>
});

PlayCircleOutlineIcon.displayName = "PlayCircleOutlineIcon";
