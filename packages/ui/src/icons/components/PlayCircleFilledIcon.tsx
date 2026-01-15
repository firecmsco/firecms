import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PlayCircleFilledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"play_circle_filled"} ref={ref}/>
});

PlayCircleFilledIcon.displayName = "PlayCircleFilledIcon";
