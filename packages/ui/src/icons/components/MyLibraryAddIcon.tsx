import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MyLibraryAddIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"my_library_add"} ref={ref}/>
});

MyLibraryAddIcon.displayName = "MyLibraryAddIcon";
