import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AudiotrackIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"audiotrack"} ref={ref}/>
});

AudiotrackIcon.displayName = "AudiotrackIcon";
