import { Typography } from "@material-ui/core";
import React from "react";
import { FieldProps, MapField } from "@camberi/firecms";

const DEFAULT_TITLE = "Title";

interface ChapterProps {
    title?: string;
}

const ChapterField = (props: FieldProps<ChapterProps>) => {
    const values = props.value;
    const title = values?.title ?? DEFAULT_TITLE;
    return (<>
        <Typography variant="h6">{title}</Typography>
        <MapField {...props}/>
    </>);
};

export default ChapterField;
