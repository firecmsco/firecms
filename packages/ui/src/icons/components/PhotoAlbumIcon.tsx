import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PhotoAlbumIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"photo_album"} ref={ref}/>
});

PhotoAlbumIcon.displayName = "PhotoAlbumIcon";
