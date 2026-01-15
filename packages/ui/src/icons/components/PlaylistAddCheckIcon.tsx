import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PlaylistAddCheckIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"playlist_add_check"} ref={ref}/>
});

PlaylistAddCheckIcon.displayName = "PlaylistAddCheckIcon";
