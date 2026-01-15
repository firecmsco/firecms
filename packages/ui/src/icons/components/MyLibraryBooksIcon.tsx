import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MyLibraryBooksIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"my_library_books"} ref={ref}/>
});

MyLibraryBooksIcon.displayName = "MyLibraryBooksIcon";
