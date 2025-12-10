import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Looks5Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"looks_5"} ref={ref}/>
});

Looks5Icon.displayName = "Looks5Icon";
