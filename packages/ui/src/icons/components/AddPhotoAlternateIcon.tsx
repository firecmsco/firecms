import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AddPhotoAlternateIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"add_photo_alternate"} ref={ref}/>
});

AddPhotoAlternateIcon.displayName = "AddPhotoAlternateIcon";
