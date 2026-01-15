import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AodIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"aod"} ref={ref}/>
});

AodIcon.displayName = "AodIcon";
