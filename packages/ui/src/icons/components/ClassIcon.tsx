import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ClassIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"class"} ref={ref}/>
});

ClassIcon.displayName = "ClassIcon";
