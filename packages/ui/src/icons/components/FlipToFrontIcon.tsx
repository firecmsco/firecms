import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FlipToFrontIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"flip_to_front"} ref={ref}/>
});

FlipToFrontIcon.displayName = "FlipToFrontIcon";
