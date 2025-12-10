import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ScreenshotMonitorIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"screenshot_monitor"} ref={ref}/>
});

ScreenshotMonitorIcon.displayName = "ScreenshotMonitorIcon";
