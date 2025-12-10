import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PlaylistAddCircleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"playlist_add_circle"} ref={ref}/>
});

PlaylistAddCircleIcon.displayName = "PlaylistAddCircleIcon";
