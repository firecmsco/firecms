import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ScreenshotIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"screenshot"} ref={ref}/>
});

ScreenshotIcon.displayName = "ScreenshotIcon";
