import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AddAPhotoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"add_a_photo"} ref={ref}/>
});

AddAPhotoIcon.displayName = "AddAPhotoIcon";
