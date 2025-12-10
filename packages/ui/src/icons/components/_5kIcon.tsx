import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _5kIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"5k"} ref={ref}/>
});

_5kIcon.displayName = "_5kIcon";
