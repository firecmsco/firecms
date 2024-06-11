import React, { useState } from "react";
import {
    AddIcon,
    Alert,
    Avatar,
    Badge,
    BooleanSwitch,
    Button,
    Card,
    Checkbox,
    Chip,
    CircularProgress,
    Collapse,
    DateTimeField,
    Dialog,
    DialogActions,
    DialogContent,
    ExpandablePanel,
    FaceIcon,
    FileUpload,
    IconButton,
    InfoLabel,
    Label,
    LoadingButton,
    Markdown,
    Menu,
    MenuItem,
    MultiSelect,
    MultiSelectItem,
    Popover,
    RadioGroup,
    RadioGroupItem,
    SearchBar,
    Select,
    SelectItem,
    Sheet,
    Skeleton,
    Tab,
    Tabs,
    TextareaAutosize,
    TextField,
    Typography
} from "@firecms/ui";
import Layout from "@theme/Layout";

const LandingPage: React.FC = () => {
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [isDialogFullScreenOpen, setDialogFullScreenOpen] = useState(false);
    const [isSheetOpen, setSheetOpen] = useState(false);
    const [isExpandablePanelOpen, setExpandablePanelOpen] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    return (
        <Layout title="FireCMS UI, batteries included">
            <div className="bg-white dark:bg-gray-800 overflow-hidden">
                <div className="relative z-10">
                    <section
                        className="relative overflow-hidden border-b border-gray-200 pt-1 bg-white text-text-primary">
                        <div className="text-center">
                            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:mt-8 sm:text-6xl">
                                FireCMS Landing Page
                            </h1>
                            <p className="mt-6 leading-7 text-gray-700 sm:text-lg sm:leading-8">
                                Showcasing the most important components
                            </p>
                        </div>
                    </section>

                    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="columns-3 gap-4">
                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Typography variant="subtitle2">Buttons</Typography>
                                <Button size="small">Small Button</Button>
                                <Button size="medium">Medium Button</Button>
                                <Button size="large" onClick={() => setDialogOpen(true)}>Large with Dialog</Button>
                            </Card>

                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Typography variant="subtitle2">Tabs</Typography>
                                <Tabs value="tab1" onValueChange={() => {
                                }}>
                                    <Tab value="tab1">Tab 1</Tab>
                                    <Tab value="tab2">Tab 2</Tab>
                                    <Tab value="tab3">Tab 3</Tab>
                                </Tabs>
                            </Card>

                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Typography variant="subtitle2">File Upload</Typography>
                                <FileUpload
                                    accept={{ "image/*": [] }}
                                    onFilesAdded={() => {
                                    }}
                                    title="Upload your file"
                                    uploadDescription="Drag and drop a file here or click"/>
                            </Card>

                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Typography variant="subtitle2">Search Bar</Typography>
                                <SearchBar onTextSearch={(text) => console.log("Search:", text)}/>
                                <SearchBar large loading/>
                            </Card>

                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Typography variant="subtitle2">Alert</Typography>
                                <Alert color="info">This is an info alert.</Alert>
                                <Alert color="error">This is an error alert.</Alert>
                                <Alert color="success" action={<Button size="small">Undo</Button>}>Alert with
                                    action</Alert>
                            </Card>

                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Markdown
                                    source="# Markdown Example\nThis is a basic Markdown rendering.\n- Bullet one\n- Bullet two"/>
                            </Card>

                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Typography variant="subtitle2">Skeleton</Typography>
                                <Skeleton/>
                                <Skeleton width={200} height={20}/>
                                <Skeleton width={140} height={20}/>
                            </Card>

                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Typography variant="subtitle2">Boolean Switch</Typography>
                                <BooleanSwitch value={true} onValueChange={() => {
                                }}/>
                                <BooleanSwitch value={false} onValueChange={() => {
                                }} size="small"/>
                            </Card>

                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Typography variant="subtitle2">Chip</Typography>
                                <Chip>Basic Chip</Chip>
                                <Chip colorScheme="redLighter">Red Light Chip</Chip>
                                <Chip size="small">Small Chip</Chip>
                                <Chip icon={<FaceIcon size="small"/>}>Chip with Icon</Chip>
                                <Chip onClick={() => console.log("Chip clicked")}>Clickable Chip</Chip>
                            </Card>

                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Typography variant="subtitle2">Textarea AutoSize</Typography>
                                <TextareaAutosize placeholder="Type your text here..." minRows={3} maxRows={6}/>
                            </Card>

                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Typography variant="subtitle2">Checkbox</Typography>
                                <Checkbox checked={true} onCheckedChange={() => {
                                }} size="medium"/>
                                <Checkbox size="small"/>
                                <Checkbox indeterminate={true} onCheckedChange={() => {
                                }}/>
                            </Card>

                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Typography variant="subtitle2">IconButton</Typography>
                                <IconButton variant="ghost" onClick={() => console.log("Clicked!")}>
                                    <AddIcon/>
                                </IconButton>
                                <IconButton variant="filled" size="small" onClick={() => console.log("Small Clicked!")}>
                                    <AddIcon size="small"/>
                                </IconButton>
                            </Card>

                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Typography variant="subtitle2">Collapse</Typography>
                                <Collapse in={true}>
                                    <div className="flow-root p-4">Content to show or hide</div>
                                </Collapse>
                            </Card>

                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Typography variant="subtitle2">Expandable Panel</Typography>
                                <ExpandablePanel title={"Click to expand"} expanded={isExpandablePanelOpen}
                                                 onExpandedChange={setExpandablePanelOpen}>
                                    <div className="flow-root p-4">Here is some content that was hidden but now is visible!</div>
                                </ExpandablePanel>
                            </Card>

                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Typography variant="subtitle2">Dialog</Typography>
                                <Button onClick={() => setDialogOpen(true)}>Open Dialog</Button>
                                <Button onClick={() => setDialogFullScreenOpen(true)}>Open FullScreen Dialog</Button>
                                <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                                    <div className="p-8">Basic Dialog Content</div>
                                </Dialog>
                                <Dialog
                                    open={isDialogFullScreenOpen}
                                    onOpenChange={setDialogFullScreenOpen}
                                    fullScreen={true}
                                >
                                    <DialogContent className="p-8 flex flex-col space-y-2">
                                        <Typography variant="h5" gutterBottom>
                                            Your dialog
                                        </Typography>
                                        <Typography gutterBottom>
                                            Full-Screen Dialog Content
                                        </Typography>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={() => setDialogFullScreenOpen(false)}
                                                variant="filled">Done</Button>
                                    </DialogActions>
                                </Dialog>
                            </Card>

                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Typography variant="subtitle2">Popover</Typography>
                                <Popover trigger={<button className="btn">Open Popover</button>}>
                                    <div className="flow-root p-4">This is a basic Popover.</div>
                                </Popover>
                                <Popover trigger={<button className="btn">Open Styled Popover</button>}
                                         className="bg-purple-500 text-white p-3 rounded-lg shadow-lg">
                                    <div className="flow-root p-4">This Popover has custom styles.</div>
                                </Popover>
                            </Card>

                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Typography variant="subtitle2">Text Field</Typography>
                                <TextField value={""} onChange={() => {
                                }} label="Basic Text Field" placeholder="Enter text"/>
                                <TextField value={""} onChange={() => {
                                }} label="Text Field with Adornment" placeholder="Enter text"
                                           endAdornment={<span>@</span>}/>
                                <TextField value={""} onChange={() => {
                                }} label="Multiline Text Field" placeholder="Enter text" multiline rows={4}/>
                            </Card>

                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Typography variant="subtitle2">Radio Group</Typography>
                                <RadioGroup className="flex items-center gap-2" defaultValue="black" id="color">
                                    <Label
                                        className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-gray-100 dark:[&:has(:checked)]:bg-gray-800"
                                        htmlFor="color-black"
                                    >
                                        <RadioGroupItem id="color-black" value="black"/>
                                        Black
                                    </Label>
                                    <Label
                                        className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-gray-100 dark:[&:has(:checked)]:bg-gray-800"
                                        htmlFor="color-white"
                                    >
                                        <RadioGroupItem id="color-white" value="white"/>
                                        White
                                    </Label>
                                    <Label
                                        className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-gray-100 dark:[&:has(:checked)]:bg-gray-800"
                                        htmlFor="color-blue"
                                    >
                                        <RadioGroupItem id="color-blue" value="blue"/>
                                        Blue
                                    </Label>
                                </RadioGroup>
                            </Card>

                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Typography variant="subtitle2">Circular Progress</Typography>
                                <CircularProgress size="large"/>
                                <CircularProgress/>
                                <CircularProgress size="small"/>
                            </Card>

                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Typography variant="subtitle2">Menu</Typography>
                                <Menu trigger={<Button variant={"outlined"}>Open Menu</Button>}>
                                    <MenuItem onClick={() => alert("Menu Item 1 clicked")}>Menu Item 1</MenuItem>
                                    <MenuItem onClick={() => alert("Menu Item 2 clicked")}>Menu Item 2</MenuItem>
                                    <MenuItem onClick={() => alert("Menu Item 3 clicked")}>Menu Item 3</MenuItem>
                                </Menu>
                            </Card>

                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Typography variant="subtitle2">DateTime Field</Typography>
                                <DateTimeField value={selectedDate} onChange={setSelectedDate} label="Select a date"
                                               mode="date"/>
                                <DateTimeField value={new Date()} onChange={setSelectedDate}
                                               label="Select date and time" mode="date_time"/>
                            </Card>

                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Typography variant="subtitle2">Avatar</Typography>
                                <Avatar>AB</Avatar>
                                <Avatar src="https://avatars.githubusercontent.com/u/5120271?v=4" alt="User Name"/>
                                <Avatar className="bg-red-500 dark:bg-red-700" style={{
                                    width: "80px",
                                    height: "80px"
                                }}>CD</Avatar>
                            </Card>

                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Typography variant="subtitle2">Select</Typography>
                                <Select value={""} onValueChange={() => {
                                }} placeholder="Select an option">
                                    <SelectItem value="option1">Option 1</SelectItem>
                                    <SelectItem value="option2">Option 2</SelectItem>
                                </Select>
                                <Select placeholder="Select your drinks" value="" onValueChange={() => {
                                }}>
                                    <SelectItem key="coffee" value="coffee">Coffee</SelectItem>
                                    <SelectItem key="tea" value="tea">Tea</SelectItem>
                                    <SelectItem key="juice" value="juice">Juice</SelectItem>
                                    <SelectItem key="soda" value="soda">Soda</SelectItem>
                                    <SelectItem key="water" value="water">Water</SelectItem>
                                </Select>
                            </Card>

                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Typography variant="subtitle2">MultiSelect</Typography>
                                <MultiSelect value={[]} label="MultiSelect" onMultiValueChange={() => {
                                }}>
                                    <MultiSelectItem value="option1">Option 1</MultiSelectItem>
                                    <MultiSelectItem value="option2">Option 2</MultiSelectItem>
                                </MultiSelect>
                                <MultiSelect value={[]} label="Custom Render MultiSelect" onMultiValueChange={() => {
                                }}>
                                    <MultiSelectItem value="red">Red</MultiSelectItem>
                                    <MultiSelectItem value="green">Green</MultiSelectItem>
                                    <MultiSelectItem value="blue">Blue</MultiSelectItem>
                                </MultiSelect>
                            </Card>

                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Typography variant="subtitle2">Sheet</Typography>
                                <Button onClick={() => setSheetOpen(true)}>Open Sheet</Button>
                                <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                                    <div className="bg-white dark:bg-gray-800 p-4 h-full">Sheet Content</div>
                                </Sheet>
                            </Card>

                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Typography variant="subtitle2">Loading Button</Typography>
                                <LoadingButton startIcon={<AddIcon size="small"/>} loading onClick={() => {
                                }}>Submitting</LoadingButton>
                            </Card>

                            <Card className="flow-root p-4 mb-6 flex flex-col gap-2">
                                <Typography variant="subtitle2">Badge</Typography>
                                <Badge color="primary"><span className="p-2">Primary Badge</span></Badge>
                                <Badge color="secondary"><span className="p-2">Secondary Badge</span></Badge>
                                <Badge invisible={true}><span className="p-2">Invisible Badge</span></Badge>
                            </Card>
                        </div>
                    </section>
                </div>
            </div>
        </Layout>
    );
};

export default LandingPage;
