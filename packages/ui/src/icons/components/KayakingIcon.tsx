import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const KayakingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"kayaking"} ref={ref}/>
});

KayakingIcon.displayName = "KayakingIcon";
