import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LibraryAddIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"library_add"} ref={ref}/>
});

LibraryAddIcon.displayName = "LibraryAddIcon";
