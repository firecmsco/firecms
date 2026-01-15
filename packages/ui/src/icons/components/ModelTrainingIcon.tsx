import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ModelTrainingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"model_training"} ref={ref}/>
});

ModelTrainingIcon.displayName = "ModelTrainingIcon";
