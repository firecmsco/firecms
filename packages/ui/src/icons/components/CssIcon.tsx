import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CssIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"css"} ref={ref}/>
});

CssIcon.displayName = "CssIcon";
