import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CreateNewFolderIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"create_new_folder"} ref={ref}/>
});

CreateNewFolderIcon.displayName = "CreateNewFolderIcon";
