import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ImageSearchIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"image_search"} ref={ref}/>
});

ImageSearchIcon.displayName = "ImageSearchIcon";
