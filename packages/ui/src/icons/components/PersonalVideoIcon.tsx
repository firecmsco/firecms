import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PersonalVideoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"personal_video"} ref={ref}/>
});

PersonalVideoIcon.displayName = "PersonalVideoIcon";
