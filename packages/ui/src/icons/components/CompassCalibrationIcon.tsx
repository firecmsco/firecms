import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CompassCalibrationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"compass_calibration"} ref={ref}/>
});

CompassCalibrationIcon.displayName = "CompassCalibrationIcon";
