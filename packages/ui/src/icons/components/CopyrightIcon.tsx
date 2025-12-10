import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CopyrightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"copyright"} ref={ref}/>
});

CopyrightIcon.displayName = "CopyrightIcon";
