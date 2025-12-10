import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ManIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"man"} ref={ref}/>
});

ManIcon.displayName = "ManIcon";
