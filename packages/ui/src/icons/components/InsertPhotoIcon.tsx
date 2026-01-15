import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const InsertPhotoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"insert_photo"} ref={ref}/>
});

InsertPhotoIcon.displayName = "InsertPhotoIcon";
