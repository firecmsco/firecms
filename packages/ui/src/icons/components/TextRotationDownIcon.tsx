import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TextRotationDownIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"text_rotation_down"} ref={ref}/>
});

TextRotationDownIcon.displayName = "TextRotationDownIcon";
