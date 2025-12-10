import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CachedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"cached"} ref={ref}/>
});

CachedIcon.displayName = "CachedIcon";
