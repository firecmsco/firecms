import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _1kIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"1k"} ref={ref}/>
});

_1kIcon.displayName = "_1kIcon";
