import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DeveloperBoardIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"developer_board"} ref={ref}/>
});

DeveloperBoardIcon.displayName = "DeveloperBoardIcon";
