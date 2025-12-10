import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HlsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hls"} ref={ref}/>
});

HlsIcon.displayName = "HlsIcon";
