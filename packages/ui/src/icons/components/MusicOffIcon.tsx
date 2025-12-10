import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MusicOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"music_off"} ref={ref}/>
});

MusicOffIcon.displayName = "MusicOffIcon";
