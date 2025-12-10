import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ArtTrackIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"art_track"} ref={ref}/>
});

ArtTrackIcon.displayName = "ArtTrackIcon";
