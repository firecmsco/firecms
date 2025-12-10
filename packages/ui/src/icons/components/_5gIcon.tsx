import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _5gIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"5g"} ref={ref}/>
});

_5gIcon.displayName = "_5gIcon";
