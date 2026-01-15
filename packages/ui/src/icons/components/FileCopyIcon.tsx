import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FileCopyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"file_copy"} ref={ref}/>
});

FileCopyIcon.displayName = "FileCopyIcon";
