import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RestoreFromTrashIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"restore_from_trash"} ref={ref}/>
});

RestoreFromTrashIcon.displayName = "RestoreFromTrashIcon";
