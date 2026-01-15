import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GasMeterIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"gas_meter"} ref={ref}/>
});

GasMeterIcon.displayName = "GasMeterIcon";
