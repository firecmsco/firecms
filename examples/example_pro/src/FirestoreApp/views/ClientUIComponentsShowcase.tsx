import {
    AddIcon,
    Alert,
    ArrowForwardIcon,
    Avatar,
    Badge,
    BooleanSwitch,
    Button,
    Card,
    Checkbox,
    Chip,
    CircularProgress,
    Collapse,
    CreditCardIcon,
    DateTimeField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    ExpandablePanel,
    FaceIcon,
    FiberManualRecordIcon,
    FileUpload,
    IconButton,
    Label,
    LoadingButton,
    Markdown,
    Menu,
    Menubar,
    MenubarCheckboxItem,
    MenubarContent,
    MenubarItem,
    MenubarItemIndicator,
    MenubarMenu,
    MenubarPortal,
    MenubarRadioGroup,
    MenubarRadioItem,
    MenubarSeparator,
    MenubarShortcut,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarSubTriggerIndicator,
    MenubarTrigger,
    MenuItem,
    MultiSelect,
    MultiSelectItem,
    MusicNoteIcon,
    Popover,
    RadioGroup,
    RadioGroupItem,
    SearchBar,
    Select,
    SelectItem,
    SettingsIcon,
    Sheet,
    Skeleton,
    Slider,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography
} from "@firecms/ui";
import React, { useState } from "react";

export default function ClientUIComponentsShowcase({
                                                       docsUrl,
                                                       linksInNewTab
                                                   }: { docsUrl?: string, linksInNewTab?: boolean }) {

    const [tabValue, setTabValue] = useState("tab1");
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [isSheetOpen, setSheetOpen] = useState(false);
    const [isExpandablePanelOpen, setExpandablePanelOpen] = useState(true);
    const [isCollapseOpen, setCollapseOpen] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [checked, setChecked] = useState<boolean | null>(true);
    const [badgeDisplayed, setBadgeDisplayed] = useState(true);
    const [textFieldValue, setTextFieldValue] = useState<string>("");
    const [sliderValue, setSliderValue] = useState<number[]>([4]);
    const cardClasses = "relative p-4 mb-6 flex flex-col gap-2 break-inside-avoid dark:bg-surface-900 dark:bg-opacity-50";

    return <div className={"max-w-6xl mx-auto "}>
        <MenubarDemo/>
        <div className="md:columns-2 lg:columns-3 gap-4">


            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/slider"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Typography variant="subtitle2">Slider</Typography>
                <Slider step={1}
                        min={0}
                        max={10}
                        value={sliderValue}
                        onValueChange={setSliderValue}/>
            </Card>

            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/button"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Typography variant="subtitle2">Buttons</Typography>
                <div className={"flex flex-row flex-wrap gap-2 items-center"}>
                    <Button size="small">Small Button</Button>
                    <Button size="medium">Medium Button</Button>
                    <Button size="large">Large Button</Button>
                    <Button variant={"neutral"}>Neutral Button</Button>
                    <Button variant={"text"}>Text Button</Button>
                    <Button variant={"outlined"}>Outlined Button</Button>
                </div>
            </Card>

            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/tabs"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Typography variant="subtitle2">Tabs</Typography>
                <Tabs value={tabValue} onValueChange={setTabValue}>
                    <Tab value="tab1">Tab 1</Tab>
                    <Tab value="tab2">Tab 2</Tab>
                    <Tab value="tab3">Tab 3</Tab>
                </Tabs>
            </Card>

            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/file_upload"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Typography variant="subtitle2">File Upload</Typography>
                <FileUpload
                    size={"large"}
                    accept={{ "image/*": [] }}
                    onFilesAdded={() => {
                    }}
                    title="Upload your file"
                    uploadDescription="Drag and drop a file here or click"/>
            </Card>

            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/search_bar"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Typography variant="subtitle2">Search Bar</Typography>
                <SearchBar innerClassName={"w-full"}/>
                <SearchBar large loading/>
            </Card>

            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/alert"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Typography variant="subtitle2">Alert</Typography>
                <Alert color="info">This is an info alert.</Alert>
                <Alert color="error">This is an error alert.</Alert>
                <Alert color="success" action={<Button size="small">Undo</Button>}>Alert with
                    action</Alert>
            </Card>

            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/markdown"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Markdown
                    source={`## Markdown Example\nThis is a basic Markdown **rendering**.\n- Bullet one\n- Bullet two`}/>
            </Card>

            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/skeleton"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Typography variant="subtitle2">Skeleton</Typography>
                <Skeleton width={240} height={20}/>
                <Skeleton/>
                <Skeleton width={180}/>
            </Card>

            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/chip"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Typography variant="subtitle2">Chip</Typography>
                <div className={"flex flex-row flex-wrap gap-2"}>
                    <Chip>Basic Chip</Chip>
                    <Chip colorScheme="redLighter">Red Light Chip</Chip>
                    <Chip colorScheme="blueDarker" size="small">Small Chip</Chip>
                    <Chip icon={<FaceIcon size="small"/>}>Chip with Icon</Chip>
                    <Chip onClick={() => console.log("Chip clicked")}>Clickable Chip</Chip>
                </div>
            </Card>


            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/boolean_switch"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Typography variant="subtitle2">Boolean Switch</Typography>
                <div className={"flex flex-row items-center gap-2"}>
                    <BooleanSwitch value={checked}
                                   size="large"
                                   onValueChange={() => {
                                       setChecked(!checked)
                                   }}/>
                    <BooleanSwitch value={checked}
                                   onValueChange={() => {
                                       setChecked(!checked)
                                   }}
                                   size="medium"/>
                    <BooleanSwitch value={checked}
                                   onValueChange={() => {
                                       setChecked(!checked)
                                   }}
                                   size="small"/>
                </div>
            </Card>

            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/checkbox"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Typography variant="subtitle2">Checkbox</Typography>

                <div className={"flex flex-row items-center gap-2"}>

                    <Tooltip title={"Regular checkbox"}>
                        <Checkbox checked={checked ?? false}
                                  onCheckedChange={() => {
                                      setChecked(!checked)
                                  }}
                                  size="medium"/>
                    </Tooltip>
                    <Tooltip title={"Small checkbox"}>
                        <Checkbox checked={checked ?? false}
                                  size="small"
                                  onCheckedChange={() => {
                                      setChecked(!checked)
                                  }}/>
                    </Tooltip>
                    <Tooltip title={"Indeterminate checkbox"}>
                        <Checkbox checked={checked ?? false}
                                  indeterminate={checked === null}
                                  onCheckedChange={() => {
                                      console.log("Checked", checked)
                                      if (checked === true) setChecked(false);
                                      else if (checked === false) setChecked(null);
                                      else setChecked(true)
                                  }}/>
                    </Tooltip>
                </div>
            </Card>

            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/icon_button"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Typography variant="subtitle2">IconButton</Typography>
                <div className={"flex gap-2 items-center"}>
                    <Tooltip title={"Ghost button"}>
                        <IconButton variant="ghost" onClick={() => console.log("Clicked!")}>
                            <MusicNoteIcon/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={"Small button"}>
                        <IconButton variant="filled" size="small" onClick={() => console.log("Small Clicked!")}>
                            <SettingsIcon size="small"/>
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
            </Card>


            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/dialog"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Typography variant="subtitle2">Dialog</Typography>
                <Button onClick={() => setDialogOpen(true)}>Open Dialog</Button>
                <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTitle>
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
            </Card>

            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/popover"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Typography variant="subtitle2">Popover</Typography>
                <Popover trigger={<Button>Open Popover</Button>}>
                    <div className="flow-root p-4">This is a basic Popover.</div>
                </Popover>
            </Card>

            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/text_field"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Typography variant="subtitle2">Text Field</Typography>
                <TextField value={textFieldValue} size={"small"} onChange={(event) => {
                    setTextFieldValue(event.target.value);
                }} label="Small Text Field" placeholder="Enter text"/>
                <TextField value={textFieldValue} onChange={(event) => {
                    setTextFieldValue(event.target.value);
                }} label="Basic Text Field" placeholder="Enter text"/>
                <TextField value={textFieldValue} onChange={(event) => {
                    setTextFieldValue(event.target.value);
                }} label="Text Field with Adornment" placeholder="Enter text"
                           endAdornment={<span>@</span>}/>
                <TextField value={textFieldValue} onChange={(event) => {
                    setTextFieldValue(event.target.value);
                }} label="Multiline Text Field" placeholder="Enter text" multiline minRows={4}/>
            </Card>

            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/radio_group"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Typography variant="subtitle2">Radio Group</Typography>
                <RadioGroup className="flex items-center gap-2" defaultValue="black" id="color">
                    <Label
                        className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-surface-100 dark:[&:has(:checked)]:bg-surface-800"
                        htmlFor="color-black"
                    >
                        <RadioGroupItem id="color-black" value="black"/>
                        Black
                    </Label>
                    <Label
                        className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-surface-100 dark:[&:has(:checked)]:bg-surface-800"
                        htmlFor="color-white"
                    >
                        <RadioGroupItem id="color-white" value="white"/>
                        White
                    </Label>
                    <Label
                        className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-surface-100 dark:[&:has(:checked)]:bg-surface-800"
                        htmlFor="color-blue"
                    >
                        <RadioGroupItem id="color-blue" value="blue"/>
                        Blue
                    </Label>
                </RadioGroup>
            </Card>

            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/circular_progress"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Typography variant="subtitle2">Circular Progress</Typography>
                <div className={"flex items-center gap-2"}>
                    <CircularProgress size="large"/>
                    <CircularProgress/>
                    <CircularProgress size="small"/>
                    <CircularProgress size="smallest"/>
                </div>
            </Card>

            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/menu"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Typography variant="subtitle2">Menu</Typography>
                <Menu trigger={<Button variant={"outlined"}>Open Menu</Button>}>
                    <MenuItem onClick={() => alert("Menu Item 1 clicked")}>Menu Item 1</MenuItem>
                    <MenuItem onClick={() => alert("Menu Item 2 clicked")}>Menu Item 2</MenuItem>
                    <MenuItem onClick={() => alert("Menu Item 3 clicked")}>Menu Item 3</MenuItem>
                </Menu>
            </Card>

            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/expandable_panel"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Typography variant="subtitle2">Expandable Panel</Typography>
                <ExpandablePanel title={"Click to expand"}
                                 expanded={isExpandablePanelOpen}
                                 onExpandedChange={setExpandablePanelOpen}>
                    <div className="flow-root p-4">Here is some content that was hidden but now is
                        visible!
                    </div>
                </ExpandablePanel>
            </Card>

            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/datetimefield"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Typography variant="subtitle2">DateTime Field</Typography>
                <DateTimeField value={selectedDate ?? undefined}
                               onChange={setSelectedDate} label="Select a date"
                               mode="date"/>
                <DateTimeField value={new Date()} onChange={setSelectedDate}
                               label="Select date and time" mode="date_time"/>
            </Card>

            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/avatar"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Typography variant="subtitle2">Avatar</Typography>
                <div className={"flex flex-row items-center gap-2"}>
                    <Avatar>AB</Avatar>
                    <Avatar src="https://avatars.githubusercontent.com/u/5120271?v=4" alt="User Name"/>
                    <Avatar className="bg-red-500 dark:bg-red-700" style={{
                        width: "80px",
                        height: "80px"
                    }}>CD</Avatar>
                </div>
            </Card>

            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/select"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Typography variant="subtitle2">Select</Typography>
                <Select value={""}
                        fullWidth={true}
                        onValueChange={() => {
                        }} placeholder="Select an option">
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                </Select>
                <Select placeholder="Select your drinks"
                        fullWidth={true}
                        value="" onValueChange={() => {
                }}>
                    <SelectItem key="coffee" value="coffee">Coffee</SelectItem>
                    <SelectItem key="tea" value="tea">Tea</SelectItem>
                    <SelectItem key="juice" value="juice">Juice</SelectItem>
                    <SelectItem key="soda" value="soda">Soda</SelectItem>
                    <SelectItem key="water" value="water">Water</SelectItem>
                </Select>
            </Card>

            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/multiselect"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Typography variant="subtitle2">MultiSelect</Typography>

                {/* Custom render example with chips */}
                <MultiSelect
                    value={[]}
                    label="Colors MultiSelect"
                    renderValues={(values) => (
                        <div className="flex gap-1">
                            {values.map(value => (
                                <Chip
                                    key={value}
                                    className={`${value === "red" ? "bg-red-200" :
                                        value === "blue" ? "bg-blue-200" :
                                            value === "green" ? "bg-green-200" : ""}`}
                                >
                                    {value}
                                </Chip>
                            ))}
                        </div>
                    )}
                    onValueChange={() => {
                    }}>
                    <MultiSelectItem value="red">Red</MultiSelectItem>
                    <MultiSelectItem value="blue">Blue</MultiSelectItem>
                    <MultiSelectItem value="green">Green</MultiSelectItem>
                </MultiSelect>
            </Card>

            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/sheet"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Typography variant="subtitle2">Sheet</Typography>
                <Button onClick={() => setSheetOpen(true)}>Open Sheet</Button>
                <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                    <div className="bg-white dark:bg-surface-800 p-4 h-full">
                        This is a sample sheet
                    </div>
                </Sheet>
            </Card>

            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/loading_button"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Typography variant="subtitle2">Loading Button</Typography>
                <LoadingButton startIcon={<AddIcon size="small"/>} loading onClick={() => {
                }}>Submitting</LoadingButton>
            </Card>

            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/badge"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Typography variant="subtitle2">Badge</Typography>
                <Badge color="primary"
                       invisible={!badgeDisplayed}>
                    <Button size={"small"}
                            variant={"outlined"}
                            onClick={() => {
                                setBadgeDisplayed(!badgeDisplayed);
                            }}
                            className="p-2">
                        Primary
                        Badge</Button></Badge>
                <Badge color="secondary" invisible={!badgeDisplayed}><span
                    className="p-2">Secondary Badge</span></Badge>
            </Card>


            <Card className={cardClasses}>
                <IconButton className="absolute top-2 right-2 hover:no-underline"
                            component={"a"}
                            target={linksInNewTab ? "_blank" : undefined}
                            href={(docsUrl ?? "") + "/docs/components/collapse"}
                            size="smallest">
                    <ArrowForwardIcon size="smallest"/>
                </IconButton>
                <Typography variant="subtitle2">Collapse</Typography>
                <Button variant={"outlined"} onClick={() => {
                    setCollapseOpen(!isCollapseOpen);
                }}>
                    Toggle Collapse
                </Button>
                <Collapse in={isCollapseOpen}>
                    <div className="flow-root p-4 rounded-lg bg-blue-100 dark:bg-blue-950">Content to show or
                        hide
                    </div>
                </Collapse>
            </Card>
        </div>
    </div>;
}

const RADIO_ITEMS = ["Andy", "Benoît", "Luis"];
const CHECK_ITEMS = ["Always Show Bookmarks Bar", "Always Show Full URLs"];

function MenubarDemo() {
    const [checkedSelection, setCheckedSelection] = React.useState([CHECK_ITEMS[1]]);
    const [radioSelection, setRadioSelection] = React.useState(RADIO_ITEMS[2]);

    return (
        <Menubar className={"rounded-lg mb-8"}>
            <MenubarMenu>
                <MenubarTrigger>
                    File
                </MenubarTrigger>
                <MenubarPortal>
                    <MenubarContent>
                        <MenubarItem>
                            New Tab{" "}
                            <MenubarShortcut>
                                ⌘ T
                            </MenubarShortcut>
                        </MenubarItem>
                        <MenubarItem>
                            New Window{" "}
                            <MenubarShortcut>
                                ⌘ N
                            </MenubarShortcut>
                        </MenubarItem>
                        <MenubarItem disabled
                        >
                            New Incognito Window
                        </MenubarItem>
                        <MenubarSeparator/>
                        <MenubarSub>
                            <MenubarSubTrigger>
                                Share
                                <MenubarSubTriggerIndicator/>
                            </MenubarSubTrigger>
                            <MenubarPortal>
                                <MenubarSubContent>
                                    <MenubarItem>
                                        Email Link
                                    </MenubarItem>
                                    <MenubarItem>
                                        Messages
                                    </MenubarItem>
                                    <MenubarItem>
                                        Notes
                                    </MenubarItem>
                                </MenubarSubContent>
                            </MenubarPortal>
                        </MenubarSub>
                        <MenubarSeparator/>
                        <MenubarItem>
                            Print…{" "}
                            <MenubarShortcut>
                                ⌘ P
                            </MenubarShortcut>
                        </MenubarItem>
                    </MenubarContent>
                </MenubarPortal>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>
                    Edit
                </MenubarTrigger>
                <MenubarPortal>
                    <MenubarContent>
                        <MenubarItem>
                            Undo{" "}
                            <MenubarShortcut
                            >
                                ⌘ Z
                            </MenubarShortcut>
                        </MenubarItem>
                        <MenubarItem>
                            Redo{" "}
                            <MenubarShortcut
                            >
                                ⇧ ⌘ Z
                            </MenubarShortcut>
                        </MenubarItem>
                        <MenubarSeparator/>
                        <MenubarSub>
                            <MenubarSubTrigger>
                                Find
                            </MenubarSubTrigger>

                            <MenubarPortal>
                                <MenubarSubContent>
                                    <MenubarItem>
                                        Search the web…
                                    </MenubarItem>
                                    <MenubarSeparator/>
                                    <MenubarItem>
                                        Find…
                                    </MenubarItem>
                                    <MenubarItem>
                                        Find Next
                                    </MenubarItem>
                                    <MenubarItem>
                                        Find Previous
                                    </MenubarItem>
                                </MenubarSubContent>
                            </MenubarPortal>
                        </MenubarSub>
                        <MenubarSeparator/>
                        <MenubarItem>
                            Cut
                        </MenubarItem>
                        <MenubarItem>
                            Copy
                        </MenubarItem>
                        <MenubarItem>
                            Paste
                        </MenubarItem>
                    </MenubarContent>
                </MenubarPortal>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>
                    View
                </MenubarTrigger>
                <MenubarPortal>
                    <MenubarContent>
                        {CHECK_ITEMS.map((item) => (
                            <MenubarCheckboxItem

                                key={item}
                                checked={checkedSelection.includes(item)}
                                onCheckedChange={() =>
                                    setCheckedSelection((current) =>
                                        current.includes(item)
                                            ? current.filter((el) => el !== item)
                                            : current.concat(item)
                                    )
                                }
                            >
                                <MenubarItemIndicator/>
                                {item}
                            </MenubarCheckboxItem>
                        ))}
                        <MenubarSeparator/>
                        <MenubarItem leftPadding={true}>
                            Reload{" "}
                            <MenubarShortcut>
                                ⌘ R
                            </MenubarShortcut>
                        </MenubarItem>
                        <MenubarItem
                            leftPadding
                            disabled>
                            Force Reload{" "}
                            <MenubarShortcut>
                                ⇧ ⌘ R
                            </MenubarShortcut>
                        </MenubarItem>
                        <MenubarSeparator/>
                        <MenubarItem
                            leftPadding>
                            Toggle Fullscreen
                        </MenubarItem>
                        <MenubarSeparator/>
                        <MenubarItem
                            leftPadding>
                            Hide Sidebar
                        </MenubarItem>
                    </MenubarContent>
                </MenubarPortal>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>
                    Profiles
                </MenubarTrigger>
                <MenubarPortal>
                    <MenubarContent>
                        <MenubarRadioGroup value={radioSelection} onValueChange={setRadioSelection}>
                            {RADIO_ITEMS.map((item) => (
                                <MenubarRadioItem
                                    key={item}
                                    value={item}>
                                    <MenubarItemIndicator>
                                        <FiberManualRecordIcon size={"smallest"}/>
                                    </MenubarItemIndicator>
                                    {item}
                                </MenubarRadioItem>
                            ))}
                            <MenubarSeparator/>
                            <MenubarItem leftPadding>
                                Edit…
                            </MenubarItem>
                            <MenubarSeparator/>
                            <MenubarItem leftPadding>
                                Add Profile…
                            </MenubarItem>
                        </MenubarRadioGroup>
                    </MenubarContent>
                </MenubarPortal>
            </MenubarMenu>
        </Menubar>
    );
};

