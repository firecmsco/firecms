import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BrowseGalleryIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"browse_gallery"} ref={ref}/>
});

BrowseGalleryIcon.displayName = "BrowseGalleryIcon";
