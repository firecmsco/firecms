import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TollIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"toll"} ref={ref}/>
});

TollIcon.displayName = "TollIcon";
