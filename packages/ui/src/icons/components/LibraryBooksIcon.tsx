import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LibraryBooksIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"library_books"} ref={ref}/>
});

LibraryBooksIcon.displayName = "LibraryBooksIcon";
