import clsx from "clsx";
import { Panel } from "../general/Panel";
import { ContainerInnerPaddingMixin } from "../styles";
import { DataTalkDemo } from "./DataTalkDemo";

export function DataTalkIntro(): JSX.Element {
    return <Panel color={"primary"} includePadding={false}>
        <div className={clsx(ContainerInnerPaddingMixin, "text-white my-24")}>
            <h2 className="relative items-center uppercase mt-8">
                <span>Talk to Your Data</span>
            </h2>

            <div className="mt-8 text-xl md:text-2xl">
                <p>Simply ask questions in natural language and get instant results.</p>
                <p>
                    <b>Powerful, intuitive, and effortless.</b>
                </p>
            </div>
            <DataTalkDemo exchanges={[
                {
                    query: "Show me all products with price > 100",
                    responseText: "This table shows all products with a price greater than 100.",
                    Component: NicerTable,
                },
                {
                    query: "Count users who signed up last month",
                    responseText:
                        "This code counts the number of users who signed up in the previous month.",
                    code: `export default async () => {
             const firestore = getFirestore();
             const now = new Date();
             const lastMonth = new Date();
             lastMonth.setMonth(lastMonth.getMonth() - 1);
           
             const usersRef = collection(firestore, "users");
             const q = query(
               usersRef,
               where("signupDate", ">=", lastMonth),
               where("signupDate", "<=", now)
             );
           
             const snapshot = await getDocs(q);
             return snapshot.size;
           };`,
                },
            ]}/>
        </div>
    </Panel>;
}

const productsData = [
    ["B000UO4KXY", "Conceal Invisible Shelf", "Home storage", "225", "Euros"],
    ["B000ZHY0JK", "Aviator RB 3025", "Sunglasses", "115", "Euros"],
    ["B001A793IW", "Wobble Chess Set", "Toys and games", "119", "Euros"]
];

// Define colors for category/currency tags for variety (optional)
const categoryColors = [
    "bg-blue-900 text-blue-200",
    "bg-pink-900 text-pink-200",
    "bg-green-900 text-green-200",
    "bg-yellow-900 text-yellow-200",
    "bg-purple-900 text-purple-200",
    "bg-indigo-900 text-indigo-200",
];
const currencyColor = "bg-sky-300 text-sky-900"; // Dark mode color for currency

function NicerTable() {

    return (
        <div
            className="h-full w-full flex flex-col bg-surface-950 text-text-primary-dark rounded-lg shadow-sm overflow-hidden border border-surface-800 border-opacity-40">
            {/* Header Toolbar Section */}
            <div
                className="border-surface-700 border-opacity-40 no-scrollbar min-h-[56px] overflow-x-auto px-2 md:px-4 bg-surface-900 border-b flex flex-row justify-between w-full flex-shrink-0">
                {/* Left Side: Title */}
                <div
                    className="flex gap-2 md:mr-4 mr-2 self-stretch items-center">
                    <div className="hidden lg:block">
                        <div className="flex flex-col items-start justify-center">
                            <h6 className="text-base font-medium leading-none truncate max-w-[160px] lg:max-w-[240px]">Products</h6>
                            <div
                                className="text-xs text-text-secondary-dark w-full text-ellipsis block overflow-hidden whitespace-nowrap max-w-xs text-left">{productsData.length} entities
                            </div>
                        </div>
                    </div>
                </div>
                {/* Right Side: Search and Action Buttons */}
                <div className="flex items-center gap-2">
                    <div
                        className="relative h-[42px] bg-surface-800 border border-surface-700 border-opacity-40 rounded-lg flex items-center">
                        <div
                            className="absolute p-0 px-4 h-full pointer-events-none flex items-center justify-center top-0 left-0">
                                       <span
                                           className="material-icons block select-none text-text-disabled-dark text-2xl">search</span>
                        </div>
                        <input placeholder="Search" readOnly
                               className="pointer-events-none placeholder-text-disabled-dark relative flex items-center rounded-lg transition-all bg-transparent outline-none appearance-none border-none pl-12 h-full text-current w-[180px]"
                               value=""/>
                    </div>
                    <button type="button" title="Download"
                            className="cursor-pointer text-surface-accent-300 visited:text-surface-300 bg-transparent inline-flex items-center justify-center p-2 text-sm font-medium focus:outline-none ease-in-out duration-150 hover:bg-surface-accent-800 hover:scale-105 transition-transform rounded-full w-10 h-10 min-w-10 min-h-10">
                        <span className="material-icons block select-none text-2xl">download</span>
                    </button>
                </div>
            </div>

            {/* Main Table Area */}
            <div className="flex-grow overflow-auto">
                {/* Sticky Header Row */}
                <div
                    className="sticky top-0 z-10 flex flex-row w-fit min-w-full border-b border-surface-700 border-opacity-40 bg-surface-900 h-12">
                    {/* Header Cell: ID */}
                    <div
                        className="flex py-0 px-3 h-full text-xs uppercase font-semibold select-none items-center text-text-secondary-dark hover:text-text-primary-dark hover:bg-surface-800 hover:bg-opacity-50 relative"
                        style={{
                            minWidth: "130px",
                            maxWidth: "130px"
                        }}>
                        <div className="overflow-hidden flex-grow flex items-center justify-center">
                            <div className="truncate mx-1">ID</div>
                        </div>
                        <div
                            className="absolute h-full w-[6px] top-0 right-0 cursor-col-resize bg-transparent hover:bg-gray-600 opacity-50"></div>
                    </div>
                    {/* Header Cell: Name */}
                    <div
                        className="flex py-0 px-3 h-full text-xs uppercase font-semibold select-none items-center text-text-secondary-dark hover:text-text-primary-dark hover:bg-surface-800 hover:bg-opacity-50 relative"
                        style={{
                            minWidth: "200px",
                            maxWidth: "200px"
                        }}>
                        <div className="overflow-hidden flex-grow flex items-center justify-start">
                                       <span className="material-icons block select-none mr-1 text-xl"
                                             style={{ fontSize: "20px" }}>short_text</span>
                            <div className="truncate mx-1">Name</div>
                        </div>
                        <div
                            className="absolute h-full w-[6px] top-0 right-0 cursor-col-resize bg-transparent hover:bg-gray-600 opacity-50"></div>
                    </div>
                    {/* Header Cell: Category */}
                    <div
                        className="flex py-0 px-3 h-full text-xs uppercase font-semibold select-none items-center text-text-secondary-dark hover:text-text-primary-dark hover:bg-surface-800 hover:bg-opacity-50 relative"
                        style={{
                            minWidth: "200px",
                            maxWidth: "200px"
                        }}>
                        <div className="overflow-hidden flex-grow flex items-center justify-start">
                                       <span className="material-icons block select-none mr-1 text-xl"
                                             style={{ fontSize: "20px" }}>list</span>
                            <div className="truncate mx-1">Category</div>
                        </div>
                        <div
                            className="absolute h-full w-[6px] top-0 right-0 cursor-col-resize bg-transparent hover:bg-gray-600 opacity-50"></div>
                    </div>
                    {/* Header Cell: Price */}
                    <div
                        className="flex py-0 px-3 h-full text-xs uppercase font-semibold select-none items-center text-text-secondary-dark hover:text-text-primary-dark hover:bg-surface-800 hover:bg-opacity-50 relative"
                        style={{
                            minWidth: "140px",
                            maxWidth: "140px"
                        }}>
                        <div className="overflow-hidden flex-grow flex items-center justify-end">
                            <span className="material-icons block select-none mr-1 text-xl">numbers</span>
                            <div className="truncate mx-1">Price</div>
                        </div>
                        <div
                            className="absolute h-full w-[6px] top-0 right-0 cursor-col-resize bg-transparent hover:bg-gray-600 opacity-50"></div>
                    </div>
                    {/* Header Cell: Currency */}
                    <div
                        className="flex py-0 px-3 h-full text-xs uppercase font-semibold select-none items-center text-text-secondary-dark hover:text-text-primary-dark hover:bg-surface-800 hover:bg-opacity-50 relative"
                        style={{
                            minWidth: "131px",
                            maxWidth: "131px"
                        }}>
                        <div className="overflow-hidden flex-grow flex items-center justify-start">
                                       <span className="material-icons block select-none mr-1 text-xl"
                                             style={{ fontSize: "20px" }}>euro_symbol</span>
                            <div className="truncate mx-1">Currency</div>
                        </div>
                        <div
                            className="absolute h-full w-[6px] top-0 right-0 cursor-col-resize bg-transparent hover:bg-gray-600 opacity-50"></div>
                    </div>
                    {/* Add Column Button Placeholder */}
                    <div
                        className="p-0.5 w-20 h-full flex items-center justify-center cursor-pointer bg-surface-950 bg-opacity-40 hover:bg-surface-950 flex-shrink-0">
                                   <span className="material-icons block select-none text-xl"
                                         style={{ fontSize: "20px" }}>add</span>
                    </div>
                </div>

                {/* Data Rows */}
                <div className="w-fit min-w-full">
                    {productsData.map((row, index) => (
                        <div key={row[0]}
                             className="flex items-center text-sm border-b border-surface-800 border-opacity-40 bg-surface-transparent hover:bg-surface-800/60 py-3">
                            {/* Cell: ID */}
                            <div
                                className="flex items-center justify-center flex-col px-2 h-full border-r border-surface-800 border-opacity-40 bg-surface-900 bg-opacity-90 flex-shrink-0"
                                style={{ width: "130px" }}>
                                <div
                                    className="w-full overflow-hidden truncate font-mono text-xs text-text-secondary-dark text-center px-1">
                                    {row[0]}
                                </div>
                            </div>
                            {/* Cell: Name */}
                            <div
                                className="flex items-center p-2 h-full border-r border-surface-800 border-opacity-40 flex-shrink-0"
                                style={{
                                    width: "200px",
                                    textAlign: "left"
                                }}>
                                <div className="truncate w-full">{row[1]}</div>
                            </div>
                            {/* Cell: Category */}
                            <div
                                className="flex items-center p-2 h-full border-r border-surface-800 border-opacity-40 flex-shrink-0"
                                style={{
                                    width: "200px",
                                    textAlign: "left"
                                }}>
                                            <span
                                                className={`rounded-lg max-w-full w-max h-fit font-medium inline-flex gap-1 text-ellipsis items-center px-3 py-1 text-sm overflow-hidden ${categoryColors[index % categoryColors.length]}`}>
                                               {row[2]}
                                           </span>
                            </div>
                            {/* Cell: Price */}
                            <div
                                className="flex items-center justify-end p-2 h-full border-r border-surface-800 border-opacity-40 flex-shrink-0"
                                style={{
                                    width: "140px",
                                    textAlign: "right"
                                }}>
                                <div className="truncate">{row[3]}</div>
                            </div>
                            {/* Cell: Currency */}
                            <div
                                className="flex items-center p-2 h-full border-r border-surface-800 border-opacity-40 flex-shrink-0"
                                style={{
                                    width: "131px",
                                    textAlign: "left"
                                }}>
                                           <span
                                               className={`rounded-lg max-w-full w-max h-fit font-medium inline-flex gap-1 text-ellipsis items-center px-3 py-1 text-sm overflow-hidden ${currencyColor}`}>
                                               {row[4]}
                                           </span>
                            </div>
                            {/* Placeholder Cell */}
                            <div className="w-20 flex-shrink-0"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
