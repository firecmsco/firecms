import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SevereColdIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"severe_cold"} ref={ref}/>
});

SevereColdIcon.displayName = "SevereColdIcon";
