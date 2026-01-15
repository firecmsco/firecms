import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MyLibraryMusicIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"my_library_music"} ref={ref}/>
});

MyLibraryMusicIcon.displayName = "MyLibraryMusicIcon";
