import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HlsOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hls_off"} ref={ref}/>
});

HlsOffIcon.displayName = "HlsOffIcon";
