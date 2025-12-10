import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PlaylistAddCheckCircleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"playlist_add_check_circle"} ref={ref}/>
});

PlaylistAddCheckCircleIcon.displayName = "PlaylistAddCheckCircleIcon";
