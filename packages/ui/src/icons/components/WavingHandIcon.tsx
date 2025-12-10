import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WavingHandIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"waving_hand"} ref={ref}/>
});

WavingHandIcon.displayName = "WavingHandIcon";
