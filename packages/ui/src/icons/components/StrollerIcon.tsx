import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StrollerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"stroller"} ref={ref}/>
});

StrollerIcon.displayName = "StrollerIcon";
