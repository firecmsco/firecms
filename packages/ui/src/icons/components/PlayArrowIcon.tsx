import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PlayArrowIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"play_arrow"} ref={ref}/>
});

PlayArrowIcon.displayName = "PlayArrowIcon";
