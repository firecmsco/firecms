import { CenteredView, Typography } from "@firecms/ui";

export function TypographyDemo() {

    return <CenteredView>
        <Typography variant="h1" gutterBottom>H1. Heading</Typography>
        <Typography variant="h2" gutterBottom>H2. Heading</Typography>
        <Typography variant="h3" gutterBottom>H3. Heading</Typography>
        <Typography variant="h4" gutterBottom>H4. Heading</Typography>
        <Typography variant="h5" gutterBottom>H5. Heading</Typography>
        <Typography variant="h6" gutterBottom>H6. Heading</Typography>
        <Typography variant="subtitle1" gutterBottom>Subtitle 1</Typography>
        <Typography variant="subtitle2" gutterBottom>Subtitle 2</Typography>
        <Typography variant="body1" gutterBottom>Body 1</Typography>
        <Typography variant="body2" gutterBottom>Body 2</Typography>
        <Typography variant="caption" gutterBottom>Caption</Typography>
        <Typography variant="label" gutterBottom>Label</Typography>
        <Typography variant="button" gutterBottom className={"block"}>Button</Typography>
    </CenteredView>
}
