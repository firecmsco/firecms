import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PhotoFilterIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"photo_filter"} ref={ref}/>
});

PhotoFilterIcon.displayName = "PhotoFilterIcon";
