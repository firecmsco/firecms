import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PlayDisabledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"play_disabled"} ref={ref}/>
});

PlayDisabledIcon.displayName = "PlayDisabledIcon";
