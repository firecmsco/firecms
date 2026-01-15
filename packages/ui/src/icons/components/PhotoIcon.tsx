import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PhotoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"photo"} ref={ref}/>
});

PhotoIcon.displayName = "PhotoIcon";
