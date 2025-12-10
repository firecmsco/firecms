import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SportsTennisIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sports_tennis"} ref={ref}/>
});

SportsTennisIcon.displayName = "SportsTennisIcon";
