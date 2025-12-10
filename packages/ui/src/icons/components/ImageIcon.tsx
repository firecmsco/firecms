import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ImageIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"image"} ref={ref}/>
});

ImageIcon.displayName = "ImageIcon";
