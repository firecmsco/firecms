import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _30fpsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"30fps"} ref={ref}/>
});

_30fpsIcon.displayName = "_30fpsIcon";
