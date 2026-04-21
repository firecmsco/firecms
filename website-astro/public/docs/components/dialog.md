# Dialog


Dialog components are used to present content in a layer above the app's main content, and they often request a user response. They are a critical component for modal dialogs, lightboxes, notification pop-ups, and custom content popups.

## Usage

To use the `Dialog`, import it from your components and pass the necessary props including `open`, `onOpenChange`, and the dialog's content as children. Optionally, you can customize its appearance with `className`, `fullWidth`, `fullHeight`, `fullScreen`, `scrollable`, `maxWidth`, `modal`, and `onOpenAutoFocus` props.

:::caution
You need to provide a `DialogTitle` in your `Dialog` component to ensure that the dialog is accessible.
You will see a warning in the console if you forget to provide a `DialogTitle`.
:::

## Basic Dialog

A basic example of using the dialog component to show a simple pop-up.

```tsx
import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    SearchIcon,
    TextField,
    Typography
} from "@firecms/ui";

export default function DialogBasicDemo() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)}>Open Dialog</Button>
            <Dialog
                open={open}
                onOpenChange={setOpen}>
                <DialogTitle variant={"h6"} className={"flex flex-row gap-4 items-center"}>
                    <SearchIcon size={"small"}/>
                    Search
                </DialogTitle>
                <DialogContent>
                    <Typography variant={"body2"}>
                        Search in your documents
                    </Typography>
                    <TextField size={"small"}/>
                </DialogContent>
                <DialogActions>
                    <Button
                        color={"primary"}
                        onClick={() => setOpen(false)} variant={"text"}>
                        Close
                    </Button>
                    <Button
                        color={"primary"}
                        onClick={() => setOpen(false)}
                        variant={"filled"}>
                        Got it!
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

```

## Full-Screen Dialog

An example of a dialog that covers the entire screen.

```tsx
import React, { useState } from "react";
import { Button, CenteredView, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@firecms/ui";

export default function DialogFullScreenDemo() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)}>Open Full-Screen Dialog</Button>
            <Dialog
                open={open}
                onOpenChange={setOpen}
                fullScreen={true}
            >
                <DialogContent
                    includeMargin={false}>
                    <CenteredView>
                        <DialogTitle variant={"h3"} includeMargin={false}>
                            Your dialog
                        </DialogTitle>
                        <Typography gutterBottom>
                            Full-Screen Dialog Content
                        </Typography>
                        <Button variant={"outlined"}>
                            Click me
                        </Button>
                    </CenteredView>
                </DialogContent>
                <DialogActions>
                    <Button
                        color={"primary"}
                        onClick={() => setOpen(false)}
                        variant={"filled"}>
                        Done
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

```

## Scrollable Dialog

Illustrates how to make a dialog's content scrollable.

```tsx
import React, { useState } from "react";
import { Button, Dialog, DialogActions } from "@firecms/ui";

export default function DialogScrollableDemo() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)}>Open Scrollable Dialog</Button>
            <Dialog
                open={open}
                onOpenChange={setOpen}
                scrollable={true}
            >
                <div className={"p-8 bg-red-100 text-red-800"} style={{ height: "200vh" }}>Scrollable Dialog Content
                </div>

                <DialogActions>
                    <Button
                        color={"primary"}
                        onClick={() => setOpen(false)}
                        variant={"filled"}>
                        Got it!
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

```

## Dialog with Custom Width

Demonstrates usage of the `maxWidth` prop to customize the dialog's width.

```tsx
import React, { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@firecms/ui";

export default function DialogCustomWidthDemo() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)}>Open Custom Width Dialog</Button>
            <Dialog
                open={open}
                onOpenChange={setOpen}
                maxWidth="5xl"
            >
                <DialogTitle variant={"h5"} gutterBottom>
                    Your dialog
                </DialogTitle>
                <DialogContent>
                    Dialog with Custom Width
                </DialogContent>
                <DialogActions>
                    <Button
                        color={"primary"}
                        onClick={() => setOpen(false)}
                        variant={"filled"}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

```

