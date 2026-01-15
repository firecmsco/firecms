import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FlipToBackIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"flip_to_back"} ref={ref}/>
});

FlipToBackIcon.displayName = "FlipToBackIcon";
