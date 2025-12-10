import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LibraryAddCheckIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"library_add_check"} ref={ref}/>
});

LibraryAddCheckIcon.displayName = "LibraryAddCheckIcon";
