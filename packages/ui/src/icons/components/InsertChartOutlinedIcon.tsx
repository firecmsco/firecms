import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const InsertChartOutlinedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"insert_chart_outlined"} ref={ref}/>
});

InsertChartOutlinedIcon.displayName = "InsertChartOutlinedIcon";
