import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PlaylistRemoveIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"playlist_remove"} ref={ref}/>
});

PlaylistRemoveIcon.displayName = "PlaylistRemoveIcon";
