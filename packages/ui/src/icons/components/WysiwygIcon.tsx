import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WysiwygIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wysiwyg"} ref={ref}/>
});

WysiwygIcon.displayName = "WysiwygIcon";
