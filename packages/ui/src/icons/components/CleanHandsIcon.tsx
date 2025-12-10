import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CleanHandsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"clean_hands"} ref={ref}/>
});

CleanHandsIcon.displayName = "CleanHandsIcon";
