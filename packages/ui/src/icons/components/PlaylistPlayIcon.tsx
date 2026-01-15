import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PlaylistPlayIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"playlist_play"} ref={ref}/>
});

PlaylistPlayIcon.displayName = "PlaylistPlayIcon";
