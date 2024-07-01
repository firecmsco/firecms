import {
    AddIcon,
    ArrowForwardIcon,
    Button,
    Checkbox,
    Chip,
    Dialog,
    FileUpload,
    IconButton,
    SearchBar,
    Skeleton,
    Tab,
    Tabs,
    Typography
} from "@firecms/ui";
import { useState } from "react";

export function ClientUIComponentsTeaser() {
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [checked, setChecked] = useState(true);

    return (
        <div className="max-w-6xl mx-auto">
            <Typography variant="h5" className="mb-4">Component Teaser</Typography>
            <div className="md:columns-2 lg:columns-3 gap-4">

                <div className="relative p-4 mb-6 flex flex-col gap-2 break-inside-avoid">
                    <IconButton className="absolute top-2 right-2 hover:no-underline" component="a"
                                href="/docs/components/button" size="smallest">
                        <ArrowForwardIcon size="smallest"/>
                    </IconButton>
                    <Button size="small">Small Button</Button>
                </div>

                <div className="relative p-4 mb-6 flex flex-col gap-2 break-inside-avoid">
                    <Tabs value="tab1" onValueChange={() => {
                    }}>
                        <Tab value="tab1">Tab 1</Tab>
                        <Tab value="tab2">Tab 2</Tab>
                    </Tabs>
                </div>

                <div className="relative p-4 mb-6 flex flex-col gap-2 break-inside-avoid">
                    <SearchBar innerClassName="w-full"/>
                </div>

                <div className="relative p-4 mb-6 flex flex-col gap-2 break-inside-avoid">
                    <FileUpload accept={{ "image/*": [] }} title="Upload your image" onFilesAdded={() => {
                        console.log("Files added");
                    }}/>
                </div>

                <div className="relative p-4 mb-6 flex flex-col gap-2 break-inside-avoid">
                    <Button onClick={() => setDialogOpen(true)}>Open Dialog</Button>
                    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                        <div className="p-4">
                            For all your dialog needs
                        </div>
                    </Dialog>
                </div>

                <div className="relative p-4 mb-6 flex flex-col gap-2 break-inside-avoid">
                    <Checkbox checked={checked} onCheckedChange={() => setChecked(!checked)} size="medium"/>
                </div>

                <div className="relative p-4 mb-6 flex flex-col gap-2 break-inside-avoid">
                    <Chip><AddIcon/>Example Badge</Chip>
                </div>

                <div className="relative p-4 mb-6 flex flex-col gap-2 break-inside-avoid">
                    <Skeleton width={120} height={20}/>
                </div>

                <div className="relative p-4 mb-6 flex flex-col gap-2 break-inside-avoid">
                    <IconButton variant="ghost"><AddIcon/></IconButton>
                    <IconButton variant="filled"><AddIcon/></IconButton>
                </div>

            </div>
        </div>
    );
}
