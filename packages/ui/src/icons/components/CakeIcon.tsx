import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CakeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"cake"} ref={ref}/>
});

CakeIcon.displayName = "CakeIcon";
