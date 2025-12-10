import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HtmlIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"html"} ref={ref}/>
});

HtmlIcon.displayName = "HtmlIcon";
