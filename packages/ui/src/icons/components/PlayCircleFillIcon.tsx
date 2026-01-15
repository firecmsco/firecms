import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PlayCircleFillIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"play_circle_fill"} ref={ref}/>
});

PlayCircleFillIcon.displayName = "PlayCircleFillIcon";
