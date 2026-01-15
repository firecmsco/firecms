import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HighlightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"highlight"} ref={ref}/>
});

HighlightIcon.displayName = "HighlightIcon";
