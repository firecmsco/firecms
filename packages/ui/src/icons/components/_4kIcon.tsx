import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _4kIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"4k"} ref={ref}/>
});

_4kIcon.displayName = "_4kIcon";
