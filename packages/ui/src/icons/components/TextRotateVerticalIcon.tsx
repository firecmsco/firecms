import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TextRotateVerticalIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"text_rotate_vertical"} ref={ref}/>
});

TextRotateVerticalIcon.displayName = "TextRotateVerticalIcon";
