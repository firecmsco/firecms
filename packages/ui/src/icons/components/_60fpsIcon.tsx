import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _60fpsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"60fps"} ref={ref}/>
});

_60fpsIcon.displayName = "_60fpsIcon";
