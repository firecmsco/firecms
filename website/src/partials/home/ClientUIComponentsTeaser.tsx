import React, { useState } from "react";
import {
    AddIcon,
    AudiotrackIcon,
    BooleanSwitch,
    Button,
    Checkbox,
    Chip,
    CreditCardIcon,
    DateTimeField,
    Dialog,
    DialogActions,
    DialogContent,
    FaceIcon,
    FileUpload,
    IconButton,
    KeyboardTabIcon,
    SearchBar,
    Select,
    SelectItem,
    SettingsIcon,
    Sheet,
    Skeleton,
    Tab,
    Tabs,
    Tooltip,
    Typography
} from "@firecms/ui";
import { CTAButtonDarkMixin } from "../styles";

import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"

export default function ClientUIComponentsTeaser() {

    const [isDialogOpen, setDialogOpen] = useState(false);
    const [isSheetOpen, setSheetOpen] = useState(false);
    const [checked, setChecked] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedValue, setSelectedValue] = useState<string>();

    return (
        <div className="max-w-6xl mx-auto px-8 my-8">
            <ResponsiveMasonry
                columnsCountBreakPoints={{
                    350: 1,
                    750: 2,
                    900: 3
                }}
            >
                <Masonry>

                    <div className={"relative p-2 flex flex-row gap-2 break-inside-avoid"}>
                        <Button>Buttons</Button>
                        <Button variant={"outlined"}>Buttons</Button>
                        <Button variant={"text"}>Buttons</Button>
                    </div>
                    <div className="relative p-2 flex flex-col gap-2 break-inside-avoid">
                        <Tabs value="tab1" onValueChange={() => {
                        }}>
                            <Tab value="tab1">Tab 1</Tab>
                            <Tab value="tab2">Tab 2</Tab>
                        </Tabs>
                    </div>

                    <div className="relative p-2 flex flex-col gap-2 break-inside-avoid">
                        <FileUpload accept={{ "image/*": [] }} title="Click or drop your image" onFilesAdded={() => {
                            console.log("Files added");
                        }}/>
                    </div>

                    <div className="relative p-2 flex flex-col gap-2 break-inside-avoid">
                        <SearchBar innerClassName="w-full"/>
                    </div>
                    <div className="relative p-2 flex flex-row gap-2 break-inside-avoid">
                        <Button variant="outlined" size="small" onClick={() => setDialogOpen(true)}>Open Dialog</Button>
                        <Button variant="outlined" size="small" onClick={() => setSheetOpen(true)}>Open side
                            sheet
                            <KeyboardTabIcon size={"small"}/>
                        </Button>
                        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>

                            <DialogContent>
                                <Typography variant={"h6"} className={"mb-2"}>Dialog</Typography>
                                This UI kit is amazing!
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    color="primary"
                                    onClick={() => setDialogOpen(false)}>
                                    Ok
                                </Button>
                            </DialogActions>
                        </Dialog>
                        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                            <div className="bg-white font-bold dark:bg-gray-800 p-4 h-full">
                                Sheet Content
                            </div>
                        </Sheet>
                    </div>

                    <div className="w-full relative p-2 flex flex-row gap-2 break-inside-avoid">
                        <Select
                            className={"w-full"}
                            value={selectedValue}
                            onValueChange={setSelectedValue}
                            placeholder={<i>Select a character</i>}
                            renderValue={(value) => {
                                if (value === "homer") {
                                    return "Homer";
                                } else if (value === "marge") {
                                    return "Marge";
                                } else if (value === "bart") {
                                    return "Bart";
                                } else if (value === "lisa") {
                                    return "Lisa";
                                }
                                throw new Error("Invalid value");
                            }}
                        >
                            <SelectItem value="homer">Homer</SelectItem>
                            <SelectItem value="marge">Marge</SelectItem>
                            <SelectItem value="bart">Bart</SelectItem>
                            <SelectItem value="lisa">Lisa</SelectItem>
                        </Select>
                    </div>

                    <div className="relative  flex flex-row gap-2 break-inside-avoid items-center">
                        <Checkbox checked={checked} onCheckedChange={() => setChecked(!checked)} size="medium"/>
                        <BooleanSwitch size="small" value={checked} onValueChange={() => setChecked(!checked)}/>
                    </div>

                    <div className="relative p-2 flex flex-col gap-2 break-inside-avoid">
                        <DateTimeField value={selectedDate}
                                       onChange={setSelectedDate}
                                       label="Select a date"
                                       mode="date"/>
                    </div>

                    <div className="relative p-2 flex flex-col gap-2 break-inside-avoid">
                        <Chip colorScheme={"yellowLight"}><FaceIcon size={"small"}/>John Peterson</Chip>
                    </div>

                    <div className="relative p-2 flex flex-col gap-2 break-inside-avoid">
                        <Skeleton width={180} height={20}/>
                        <Skeleton width={2000} height={16}/>
                        <Skeleton width={120} height={16}/>
                    </div>

                    <div className="relative p-2 flex flex-row gap-2 break-inside-avoid items-center">
                        <Tooltip title={"Small button"}>
                            <IconButton variant="filled" size="small" onClick={() => console.log("Small Clicked!")}>
                                <SettingsIcon size="small"/>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={"Ghost button"}>
                            <IconButton variant="ghost" onClick={() => console.log("Clicked!")}>
                                <AudiotrackIcon/>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={"Filled button"}>
                            <IconButton
                                variant="filled"
                                onClick={() => console.log("Square Clicked!")}>
                                <AddIcon/>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={"Square filled button"}>
                            <IconButton
                                variant="filled"
                                shape="square"
                                onClick={() => console.log("Square Clicked!")}>
                                <CreditCardIcon/>
                            </IconButton>
                        </Tooltip>
                    </div>

                </Masonry>
            </ResponsiveMasonry>
            <a
                className={CTAButtonDarkMixin + " w-full lg:w-auto mt-8"}
                href={"/ui"}
            >
                See all components
            </a>
        </div>
    );
}
