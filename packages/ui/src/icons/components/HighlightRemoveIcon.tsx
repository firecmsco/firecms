import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HighlightRemoveIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"highlight_remove"} ref={ref}/>
});

HighlightRemoveIcon.displayName = "HighlightRemoveIcon";
