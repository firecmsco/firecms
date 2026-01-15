import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CropOriginalIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"crop_original"} ref={ref}/>
});

CropOriginalIcon.displayName = "CropOriginalIcon";
