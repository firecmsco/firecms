import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FilePresentIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"file_present"} ref={ref}/>
});

FilePresentIcon.displayName = "FilePresentIcon";
