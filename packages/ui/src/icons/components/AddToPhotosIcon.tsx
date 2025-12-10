import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AddToPhotosIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"add_to_photos"} ref={ref}/>
});

AddToPhotosIcon.displayName = "AddToPhotosIcon";
