import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ViewComfyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"view_comfy"} ref={ref}/>
});

ViewComfyIcon.displayName = "ViewComfyIcon";
