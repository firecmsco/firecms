import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CellTowerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"cell_tower"} ref={ref}/>
});

CellTowerIcon.displayName = "CellTowerIcon";
