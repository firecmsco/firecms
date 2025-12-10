import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TextRotateUpIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"text_rotate_up"} ref={ref}/>
});

TextRotateUpIcon.displayName = "TextRotateUpIcon";
