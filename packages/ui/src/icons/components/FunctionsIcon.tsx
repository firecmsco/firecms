import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FunctionsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"functions"} ref={ref}/>
});

FunctionsIcon.displayName = "FunctionsIcon";
