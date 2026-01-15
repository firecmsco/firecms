import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PictureAsPdfIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"picture_as_pdf"} ref={ref}/>
});

PictureAsPdfIcon.displayName = "PictureAsPdfIcon";
