import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const _10kIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"10k"} ref={ref}/>
});

_10kIcon.displayName = "_10kIcon";
