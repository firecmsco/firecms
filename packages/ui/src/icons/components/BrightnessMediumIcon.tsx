import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BrightnessMediumIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"brightness_medium"} ref={ref}/>
});

BrightnessMediumIcon.displayName = "BrightnessMediumIcon";
