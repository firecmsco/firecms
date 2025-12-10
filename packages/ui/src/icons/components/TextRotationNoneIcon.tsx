import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TextRotationNoneIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"text_rotation_none"} ref={ref}/>
});

TextRotationNoneIcon.displayName = "TextRotationNoneIcon";
