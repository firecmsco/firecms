import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WrapTextIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wrap_text"} ref={ref}/>
});

WrapTextIcon.displayName = "WrapTextIcon";
