import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LibraryMusicIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"library_music"} ref={ref}/>
});

LibraryMusicIcon.displayName = "LibraryMusicIcon";
