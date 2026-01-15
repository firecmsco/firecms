import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PublishIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"publish"} ref={ref}/>
});

PublishIcon.displayName = "PublishIcon";
