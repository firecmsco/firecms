import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const OndemandVideoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"ondemand_video"} ref={ref}/>
});

OndemandVideoIcon.displayName = "OndemandVideoIcon";
