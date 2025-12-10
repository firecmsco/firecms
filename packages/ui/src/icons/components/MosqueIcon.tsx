import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MosqueIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mosque"} ref={ref}/>
});

MosqueIcon.displayName = "MosqueIcon";
