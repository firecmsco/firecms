import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ShortTextIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"short_text"} ref={ref}/>
});

ShortTextIcon.displayName = "ShortTextIcon";
