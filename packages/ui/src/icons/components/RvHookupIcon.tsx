import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RvHookupIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"rv_hookup"} ref={ref}/>
});

RvHookupIcon.displayName = "RvHookupIcon";
