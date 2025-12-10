import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PhotoLibraryIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"photo_library"} ref={ref}/>
});

PhotoLibraryIcon.displayName = "PhotoLibraryIcon";
