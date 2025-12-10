import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TextRotationAngledownIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"text_rotation_angledown"} ref={ref}/>
});

TextRotationAngledownIcon.displayName = "TextRotationAngledownIcon";
