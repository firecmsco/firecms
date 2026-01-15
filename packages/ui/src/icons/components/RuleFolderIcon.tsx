import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RuleFolderIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"rule_folder"} ref={ref}/>
});

RuleFolderIcon.displayName = "RuleFolderIcon";
