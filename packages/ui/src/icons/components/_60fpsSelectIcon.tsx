import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _60fpsSelectIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"60fps_select"} ref={ref}/>
});

_60fpsSelectIcon.displayName = "_60fpsSelectIcon";
