import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DeleteForeverIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"delete_forever"} ref={ref}/>
});

DeleteForeverIcon.displayName = "DeleteForeverIcon";
