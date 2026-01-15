import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FitScreenIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"fit_screen"} ref={ref}/>
});

FitScreenIcon.displayName = "FitScreenIcon";
