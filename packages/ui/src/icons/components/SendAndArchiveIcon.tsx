import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SendAndArchiveIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"send_and_archive"} ref={ref}/>
});

SendAndArchiveIcon.displayName = "SendAndArchiveIcon";
