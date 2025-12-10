import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const InsertChartIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"insert_chart"} ref={ref}/>
});

InsertChartIcon.displayName = "InsertChartIcon";
