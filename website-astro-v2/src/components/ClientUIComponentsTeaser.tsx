import React, { useState } from "react";
import {
    AddIcon,
    BooleanSwitch,
    Button,
    Checkbox,
    ChildFriendlyIcon,
    Chip,
    CreditCardIcon,
    DateTimeField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FaceIcon,
    FileUpload,
    IconButton,
    KeyboardTabIcon,
    MultiSelect,
    MultiSelectItem,
    MusicNoteIcon,
    Person2Icon,
    Person4Icon,
    PersonIcon,
    SearchBar,
    Select,
    SelectItem,
    SettingsIcon,
    Sheet,
    Skeleton,
    Tab,
    Tabs,
    Tooltip
} from "@firecms/ui";

export default function ClientUIComponentsTeaser() {

    const [tabValue, setTabValue] = useState("tab1");
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [isSheetOpen, setSheetOpen] = useState(false);
    const [checked, setChecked] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedValue, setSelectedValue] = useState<string>();
    const [multiSelectedValue, setMultiSelectedValue] = useState<string[]>();
    const cardClasses = "relative p-4 flex flex-col gap-2 break-inside-avoid dark:bg-surface-950 mb-4 rounded-xl";

    return (
        <div className={"@container max-w-7xl mx-auto not-content my-8"}>
            <div className="@xl:columns-2 @4xl:columns-3 gap-4">

                <div className={cardClasses + " flex-row"}>
                    <Button>Buttons</Button>
                    <Button variant={"outlined"}>Buttons</Button>
                    <Button variant={"text"}>Buttons</Button>
                </div>

                <div className={cardClasses}>
                    <Tabs value={tabValue} onValueChange={setTabValue}>
                        <Tab value="tab1">Tab 1</Tab>
                        <Tab value="tab2">Tab 2</Tab>
                        <Tab value="tab3">Tab 3</Tab>
                    </Tabs>
                </div>

                <div className={cardClasses}>
                    <FileUpload accept={{ "image/*": [] }} title="Click or drop your image" onFilesAdded={() => {
                        console.log("Files added");
                    }}/>
                </div>

                <div className={cardClasses}>
                    <Select
                        size={"large"}
                        className={"w-full"}
                        value={selectedValue}
                        onValueChange={setSelectedValue}
                        placeholder={<i>Select a Simpsons character</i>}
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

                <div className={cardClasses}>
                    <SearchBar innerClassName="w-full"/>
                </div>

                <div className={cardClasses + " flex-row"}>
                    <Button variant="outlined" size="small" onClick={() => setDialogOpen(true)}>Open Dialog</Button>
                    <Button variant="outlined" size="small" onClick={() => setSheetOpen(true)}>Open side
                        sheet
                        <KeyboardTabIcon size={"small"}/>
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>

                        <DialogTitle variant={"h6"} gutterBottom>
                            Dialog
                        </DialogTitle>
                        <DialogContent>
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


                <div className={cardClasses + " flex-row items-center"}>
                    <Tooltip title={"Small button"}>
                        <IconButton variant="filled" size="small" onClick={() => console.log("Small Clicked!")}>
                            <SettingsIcon size="small"/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={"Ghost button"}>
                        <IconButton variant="ghost" onClick={() => console.log("Clicked!")}>
                            <MusicNoteIcon/>
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

                <div className={cardClasses}>
                    <DateTimeField value={selectedDate}
                                   onChange={setSelectedDate}
                                   label="Select a date"
                                   mode="date"/>
                </div>

                <div className={cardClasses + " flex-row items-center"}>
                    <Checkbox checked={checked} onCheckedChange={() => setChecked(!checked)} size="medium"/>
                    <BooleanSwitch size="small" value={checked} onValueChange={() => setChecked(!checked)}/>
                </div>

                <div className={cardClasses}>
                    <MultiSelect
                        className={"w-full"}
                        value={multiSelectedValue}
                        onValueChange={setMultiSelectedValue}
                        placeholder={<i>Multi select</i>}
                    >
                        <MultiSelectItem value="mother"><Person2Icon/>Mother</MultiSelectItem>
                        <MultiSelectItem value="father"><PersonIcon/>Father</MultiSelectItem>
                        <MultiSelectItem value="kid"><Person4Icon/>Kid</MultiSelectItem>
                        <MultiSelectItem value="baby"><ChildFriendlyIcon/>Baby</MultiSelectItem>
                    </MultiSelect>
                </div>

                <div className={cardClasses}>
                    <Skeleton width={180} height={20}/>
                    <Skeleton width={2000} height={16}/>
                    <Skeleton width={120} height={16}/>
                </div>

                <div className={cardClasses}>
                    <Chip colorScheme={"yellowLight"}><FaceIcon size={"small"}/>John Peterson</Chip>
                </div>

            </div>
            <div className="text-center">
                <a
                    className={"inline-flex items-center justify-center gap-x-2 rounded-md text-primary px-6 py-3 text-base font-semibold  hover:text-primary-dark transition-all duration-200 ease-in-out btn-glow w-full lg:w-auto mt-8"}
                    href={"/ui"}
                >
                    See all components
                </a>
            </div>
        </div>
    );
};
