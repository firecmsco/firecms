import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DeveloperBoardOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"developer_board_off"} ref={ref}/>
});

DeveloperBoardOffIcon.displayName = "DeveloperBoardOffIcon";
