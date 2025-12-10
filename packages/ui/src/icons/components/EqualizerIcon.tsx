import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EqualizerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"equalizer"} ref={ref}/>
});

EqualizerIcon.displayName = "EqualizerIcon";
