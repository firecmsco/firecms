import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SlowMotionVideoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"slow_motion_video"} ref={ref}/>
});

SlowMotionVideoIcon.displayName = "SlowMotionVideoIcon";
