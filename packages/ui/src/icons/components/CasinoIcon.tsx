import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CasinoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"casino"} ref={ref}/>
});

CasinoIcon.displayName = "CasinoIcon";
