import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CropIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"crop"} ref={ref}/>
});

CropIcon.displayName = "CropIcon";
