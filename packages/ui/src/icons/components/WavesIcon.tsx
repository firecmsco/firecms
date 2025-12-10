import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WavesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"waves"} ref={ref}/>
});

WavesIcon.displayName = "WavesIcon";
