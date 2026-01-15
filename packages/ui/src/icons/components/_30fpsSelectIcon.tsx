import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _30fpsSelectIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"30fps_select"} ref={ref}/>
});

_30fpsSelectIcon.displayName = "_30fpsSelectIcon";
