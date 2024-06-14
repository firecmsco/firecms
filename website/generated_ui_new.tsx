import React, { useState } from "react";
import {
    Alert,
    Avatar,
    Badge,
    BooleanSwitch,
    Button,
    Card,
    CenteredView,
    Checkbox,
    Chip,
    CircularProgress,
    Collapse,
    DateTimeField,
    DebouncedTextField,
    Dialog,
    ExpandablePanel,
    FileUpload,
    IconButton,
    InfoLabel,
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
    Typography,
    Tabs,
    TextareaAutosize,
    TextField
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
                    <section className="relative overflow-hidden border-b border-gray-200 pt-1 bg-white text-text-primary">
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
                            <Card className="p-4 mb-6">
                                <Typography variant="subtitle2">Buttons</Typography>
                                <Button size="small">Small Button</Button>
                                <Button size="medium">Medium Button</Button>
                                <Button size="large" onClick={() => setDialogOpen(true)}>Large with Dialog</Button>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Typography variant="subtitle2">Tabs</Typography>
                                <Tabs value="tab1" onValueChange={() => {}}>
                                    <Tab value="tab1">Tab 1</Tab>
                                    <Tab value="tab2">Tab 2</Tab>
                                    <Tab value="tab3">Tab 3</Tab>
                                </Tabs>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Typography variant="subtitle2">File Upload</Typography>
                                <FileUpload 
                                    accept={{ "image/*": [] }}
                                    onFilesAdded={() => {}} 
                                    title="Upload your file" 
                                    uploadDescription="Drag and drop a file here or click"/>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Typography variant="subtitle2">Info Label</Typography>
                                <InfoLabel mode="info">This is an informational message.</InfoLabel>
                                <InfoLabel mode="warn">This is a warning message.</InfoLabel>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Typography variant="subtitle2">Search Bar</Typography>
                                <SearchBar onTextSearch={(text) => console.log("Search:", text)}/>
                                <SearchBar large loading/>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Typography variant="subtitle2">Alert</Typography>
                                <Alert color="info">This is an info alert.</Alert>
                                <Alert color="error">This is an error alert.</Alert>
                                <Alert color="success" action={<Button size="small">Undo</Button>}>Alert with action</Alert>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Markdown source="# Markdown Example\nThis is a basic Markdown rendering.\n- Bullet one\n- Bullet two" />
                                <Markdown source="# Custom Styled Markdown\nYou can apply custom styles using the `className` prop." className="p-4 rounded text-blue-500 bg-gray-100"/>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Typography variant="h6">Skeleton</Typography>
                                <Skeleton/>
                                <Skeleton width={200} height={20}/>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Typography variant="subtitle2">Boolean Switch</Typography>
                                <BooleanSwitch value={true} onValueChange={() => {}}/>
                                <BooleanSwitch value={false} onValueChange={() => {}} size="small"/>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Typography variant="subtitle2">Chip</Typography>
                                <Chip>Basic Chip</Chip>
                                <Chip colorScheme="redLighter">Red Light Chip</Chip>
                                <Chip size="small">Small Chip</Chip>
                                <Chip icon={<FaceIcon size="small"/>}>Chip with Icon</Chip>
                                <Chip onClick={() => console.log("Chip clicked")}>Clickable Chip</Chip>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Typography variant="subtitle2">Textarea AutoSize</Typography>
                                <TextareaAutosize placeholder="Type your text here..." minRows={3} maxRows={6}/>
                                <TextareaAutosize placeholder="Controlled example..." value="Controlled textarea" onChange={() => {}}/>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Typography variant="subtitle2">Checkbox</Typography>
                                <Checkbox checked={true} onCheckedChange={() => {}} size="medium"/>
                                <Checkbox size="small"/> 
                                <Checkbox indeterminate={true} onCheckedChange={() => {}}/>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Typography variant="subtitle2">IconButton</Typography>
                                <IconButton variant="ghost" onClick={() => console.log("Clicked!")}>
                                    <AddIcon />
                                </IconButton>
                                <IconButton variant="filled" size="small" onClick={() => console.log("Small Clicked!")}>
                                    <AddIcon size="small" />
                                </IconButton>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Typography variant="subtitle2">Collapse</Typography>
                                <Collapse in={true}>
                                    <div className="p-4">Content to show or hide</div>
                                </Collapse>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Typography variant="subtitle2">Expandable Panel</Typography>
                                <ExpandablePanel title={"Click to expand"} expanded={isExpandablePanelOpen} onExpandedChange={setExpandablePanelOpen}>
                                    <div className="p-4">Here is some content that was hidden but now is visible!</div>
                                </ExpandablePanel>
                            </Card>

                            <Card className="p-4 mb-6">
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
                                        <Button onClick={() => setDialogFullScreenOpen(false)} variant="filled">Done</Button>
                                    </DialogActions>
                                </Dialog>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Typography variant="subtitle2">Popover</Typography>
                                <Popover trigger={<button className="btn">Open Popover</button>}>
                                    <div className="p-4">This is a basic Popover.</div>
                                </Popover>
                                <Popover trigger={<button className="btn">Open Styled Popover</button>} className="bg-purple-500 text-white p-3 rounded-lg shadow-lg">
                                    <div className="p-4">This Popover has custom styles.</div>
                                </Popover>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Typography variant="subtitle2">Text Field</Typography>
                                <TextField value={""} onChange={() => {}} label="Basic Text Field" placeholder="Enter text"/>
                                <TextField value={""} onChange={() => {}} label="Text Field with Adornment" placeholder="Enter text" endAdornment={<span>@</span>}/>
                                <TextField value={""} onChange={() => {}} label="Multiline Text Field" placeholder="Enter text" multiline rows={4}/>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Typography variant="subtitle2">Radio Group</Typography>
                                <RadioGroup onValueChange={() => {}}>
                                    <RadioGroupItem value="1">Option 1</RadioGroupItem>
                                    <RadioGroupItem value="2">Option 2</RadioGroupItem>
                                    <RadioGroupItem value="3">Option 3</RadioGroupItem>
                                </RadioGroup>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Typography variant="subtitle2">Debounced Text Field</Typography>
                                <DebouncedTextField value={""} onChange={() => {}}/>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Typography variant="subtitle2">Circular Progress</Typography>
                                <CircularProgress/>
                                <CircularProgress size="small"/>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Typography variant="subtitle2">Menu</Typography>
                                <Menu trigger={<Button>Open Menu</Button>}>
                                    <MenuItem onClick={() => alert("Menu Item 1 clicked")}>Menu Item 1</MenuItem>
                                    <MenuItem onClick={() => alert("Menu Item 2 clicked")}>Menu Item 2</MenuItem>
                                    <MenuItem onClick={() => alert("Menu Item 3 clicked")}>Menu Item 3</MenuItem>
                                </Menu>
                                <Menu trigger={<div style={{ cursor: 'pointer', padding: '10px', background: 'grey', color: 'white' }}>Click me</div>}>
                                    <MenuItem onClick={() => alert("Action 1")}>Action 1</MenuItem>
                                    <MenuItem onClick={() => alert("Action 2")}>Action 2</MenuItem>
                                    <MenuItem onClick={() => alert("Action 3")}>Action 3</MenuItem>
                                </Menu>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Typography variant="subtitle2">DateTime Field</Typography>
                                <DateTimeField value={selectedDate} onChange={setSelectedDate} label="Select a date" mode="date"/>
                                <DateTimeField value={new Date()} onChange={setSelectedDate} label="Select date and time" mode="date_time"/>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Typography variant="subtitle2">Avatar</Typography>
                                <Avatar>AB</Avatar>
                                <Avatar src="https://avatars.githubusercontent.com/u/5120271?v=4" alt="User Name" />
                                <Avatar className="bg-red-500 dark:bg-red-700" style={{ width: '80px', height: '80px' }}>CD</Avatar>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Typography variant="subtitle2">Select</Typography>
                                <Select value={""} onValueChange={() => {}} placeholder="Select an option">
                                    <SelectItem value="option1">Option 1</SelectItem>
                                    <SelectItem value="option2">Option 2</SelectItem>
                                </Select>
                                <Select placeholder="Select your drinks" value="" onValueChange={() => {}}>
                                    <SelectItem key="coffee" value="coffee">Coffee</SelectItem>
                                    <SelectItem key="tea" value="tea">Tea</SelectItem>
                                    <SelectItem key="juice" value="juice">Juice</SelectItem>
                                    <SelectItem key="soda" value="soda">Soda</SelectItem>
                                    <SelectItem key="water" value="water">Water</SelectItem>
                                </Select>
                                <SelectGroup label="Group 1">
                                    <SelectItem value="option1-1">Option 1-1</SelectItem>
                                    <SelectItem value="option1-2">Option 1-2</SelectItem>
                                </SelectGroup>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Typography variant="subtitle2">MultiSelect</Typography>
                                <MultiSelect value={[]} label="MultiSelect" onMultiValueChange={() => {}}>
                                    <MultiSelectItem value="option1">Option 1</MultiSelectItem>
                                    <MultiSelectItem value="option2">Option 2</MultiSelectItem>
                                </MultiSelect>
                                <MultiSelect value={[]} label="Custom Render MultiSelect" onMultiValueChange={() => {}}>
                                    <MultiSelectItem value="red">Red</MultiSelectItem>
                                    <MultiSelectItem value="green">Green</MultiSelectItem>
                                    <MultiSelectItem value="blue">Blue</MultiSelectItem>
                                </MultiSelect>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Typography variant="subtitle2">Sheet</Typography>
                                <Button onClick={() => setSheetOpen(true)}>Open Sheet</Button>
                                <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                                    <div className="bg-white dark:bg-gray-800 p-4 h-full">Sheet Content</div>
                                </Sheet>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Typography variant="subtitle2">Loading Button</Typography>
                                <LoadingButton loading={false} onClick={() => {}}>Click Me</LoadingButton>
                                <LoadingButton startIcon={<AddIcon size="small" />} loading onClick={() => {}}>With Icon</LoadingButton>
                            </Card>

                            <Card className="p-4 mb-6">
                                <Typography variant="subtitle2">Centered View</Typography>
                                <CenteredView>Basic centered view content.</CenteredView>
                                <CenteredView className="bg-red-200 dark:bg-red-900">Centered view with custom styling.</CenteredView>
                            </Card>

                            <Card className="p-4 mb-6">
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