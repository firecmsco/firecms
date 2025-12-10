import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HighlightAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"highlight_alt"} ref={ref}/>
});

HighlightAltIcon.displayName = "HighlightAltIcon";
