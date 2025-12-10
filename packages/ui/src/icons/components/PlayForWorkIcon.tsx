import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PlayForWorkIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"play_for_work"} ref={ref}/>
});

PlayForWorkIcon.displayName = "PlayForWorkIcon";
