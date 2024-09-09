import React, { useEffect, useState } from "react";
import {
    BooleanSwitchWithLabel,
    Button,
    Checkbox,
    CircularProgress,
    DateTimeField,
    Label, MultiSelect, MultiSelectItem,
    Paper,
    RadioGroup, RadioGroupItem,
    Select,
    SelectItem,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
    TextField,
    Typography
} from "@firecms/ui";
import {
    Company,
    CompanyTokenBatch,
    fetchCompanies,
    fetchCompanyTokenBatches,
    fetchSubscriptions,
    fetchUsers,
    Subscription,
    User
} from "./api";
import { useAuthController, useSnackbarController } from "@firecms/core";

const fields_140a = [
    "ReferenzID", // User ID
    "Satzart", // KOP | POS
    // ... other fields
];

const fieldsStandard = [
    "id",
    "registration_date",
    "billing_interaction",
    // ... other fields
];

type SubscriptionWithUser = Subscription & User & {
    company_name: string,
    contract_number_140a: string,
    insurance_id_140a: string
};

function mergeInvoicesAndUsersData(invoices: Subscription[], users: User[], selectedCompany: Company) {
    return invoices.map((invoice) => {
        const user = users.find((u) => String(u.id) === String(invoice.id));
        return {
            ...invoice,
            ...user,
            company_name: selectedCompany.name,
            insurance_id_140a: selectedCompany?.insurance_id_140a,
            contract_number_140a: selectedCompany?.contract_number_140a
        } as SubscriptionWithUser;
    });
}

export function InvoicesExport() {
    const snackbar = useSnackbarController();
    const [subscriptions, setSubscriptions] = useState<SubscriptionWithUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [onlyBilled, setOnlyBilled] = useState<boolean>(false);
    const [onlyNonBilled, setOnlyNonBilled] = useState<boolean>(false);
    const [selectedCompanies, setSelectedCompanies] = useState<{
        company?: Company,
        companyTokenBatches?: CompanyTokenBatch[]
    }[]>([{
        company: undefined,
        companyTokenBatches: []
    }]);
    const [firebaseToken, setFirebaseToken] = useState<string | undefined>(undefined);
    const [format, setFormat] = useState<"140A" | "standard">("standard");
    const [includeExcelStringFormat, setIncludeExcelStringFormat] = useState<boolean>(true);
    const [selectedSubscriptions, setSelectedSubscriptions] = useState<number[]>([]);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const [startDate, setStartDate] = useState<Date | null>(oneMonthAgo);
    const [endDate, setEndDate] = useState<Date | null>(new Date());
    const [minCompletedInteractions, setMinCompletedInteractions] = useState<number | null>(null);
    const authController = useAuthController();

    const loadInvoices = async () => {
        if (!firebaseToken || !startDate || !endDate) return;
        setLoading(true);
        setError(null);
        await Promise.all(selectedCompanies.map(async ({ company, companyTokenBatches }) => {
            if (!company || !companyTokenBatches) return [];
            return await loadInvoicesForCompany(company, companyTokenBatches);
        })).then((subscriptionsWithUsers: SubscriptionWithUser[][]) => {
            const res = subscriptionsWithUsers.flat();
            setSubscriptions(res);
        }).finally(() => {
            setLoading(false);
        });
    };

    const loadInvoicesForCompany = async (company: Company, companyTokenBatches: CompanyTokenBatch[]): Promise<SubscriptionWithUser[]> => {
        if (!firebaseToken || !company || !startDate || !endDate) return [];
        const subscriptions = await fetchSubscriptions(
            firebaseToken,
            company.id,
            startDate,
            endDate,
            onlyBilled,
            onlyNonBilled,
            companyTokenBatches.map(tb => tb.id),
            minCompletedInteractions
        );
        const users = await fetchUsers(firebaseToken, subscriptions.map((i) => parseInt(i.id)));
        const subscriptionsWithUsers = mergeInvoicesAndUsersData(subscriptions, users, company);
        console.log({ subscriptions, users });
        subscriptionsWithUsers.sort((a, b) => parseInt(a.subscription_id) - parseInt(b.subscription_id));
        return subscriptionsWithUsers;
    };

    const doDownload = () => {
        const csv = getCSV(subscriptions, selectedSubscriptions, format, includeExcelStringFormat);
        console.log({ csv });
        downloadBlob(csv, "invoices.csv", "text/csv;charset=utf-8");
    };

    const doUpload = () => {
        // Upload logic
    };

    useEffect(() => {
        authController.getAuthToken().then((authToken) => setFirebaseToken(authToken));
    }, [authController.user]);

    if (!firebaseToken) return <div>Loading...</div>;

    const canDoRequest = selectedCompanies.length > 0 && selectedCompanies.every(({
                                                                                      company,
                                                                                      companyTokenBatches
                                                                                  }) => company && (companyTokenBatches ?? []).length > 0);

    return (
        <div className="flex flex-row h-full">
            <div className="flex flex-col justify-center items-center max-w-xs p-2">
                {error && <div>{error?.message}</div>}
                <div className="flex flex-col overflow-auto h-full w-full gap-2 my-3">
                    <Typography variant={"h3"}>Invoices</Typography>
                    {selectedCompanies.map((entry, index) => <CompanyWidgetEntry
                        company={entry.company}
                        tokenBatches={entry.companyTokenBatches}
                        firebaseToken={firebaseToken}
                        setCompany={(company) => {
                            const newSelectedCompanies = [...selectedCompanies];
                            newSelectedCompanies[index].company = company;
                            setSelectedCompanies(newSelectedCompanies);
                        }}
                        setCompanyTokenBatches={(tokenBatches) => {
                            const newSelectedCompanies = [...selectedCompanies];
                            newSelectedCompanies[index].companyTokenBatches = tokenBatches;
                            setSelectedCompanies(newSelectedCompanies);
                        }}
                        includeRemove={selectedCompanies.length > 1}
                        onRemove={() => {
                            if (selectedCompanies.length > 1) {
                                const newSelectedCompanies = [...selectedCompanies];
                                newSelectedCompanies.splice(index, 1);
                                setSelectedCompanies(newSelectedCompanies);
                            }
                        }}
                        key={`company-widget-${index}`}
                    />)}
                    <Button onClick={() => {
                        setSelectedCompanies([...selectedCompanies, { company: undefined, companyTokenBatches: [] }]);
                    }}>Add company</Button>
                    <BooleanSwitchWithLabel label={"Only billed"} value={onlyBilled} onValueChange={(checked) => {
                        if (checked) setOnlyNonBilled(false);
                        setOnlyBilled(checked);
                    }}/>
                    <BooleanSwitchWithLabel label={"Only non-billed"} value={onlyNonBilled}
                                            onValueChange={(checked) => {
                                                if (checked) setOnlyBilled(false);
                                                setOnlyNonBilled(checked);
                                            }}/>
                    <div className="flex flex-row gap-2">
                        <DateTimeField
                            label="Start Date"
                            value={startDate}
                            onChange={setStartDate}
                        />
                        <DateTimeField
                            label="End date"
                            value={endDate}
                            onChange={setEndDate}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <BooleanSwitchWithLabel label={"Min interactions"} value={minCompletedInteractions !== null}
                                                onValueChange={(checked) => {
                                                    if (checked) setMinCompletedInteractions(0);
                                                    else setMinCompletedInteractions(null);
                                                }}/>
                        <TextField
                            label="Min interactions"
                            disabled={minCompletedInteractions === null}
                            type={"number"}
                            value={minCompletedInteractions != null ? minCompletedInteractions : ""}
                            onChange={(event) => setMinCompletedInteractions(parseInt(event.target.value))}
                        />
                    </div>
                    <Button
                        disabled={!canDoRequest || !startDate || !endDate}
                        size={"large"}
                        onClick={loadInvoices}
                    >
                        {loading ? <CircularProgress size={"small"}/> : "Update data"}
                    </Button>
                </div>
            </div>
            <div className="flex-grow h-full p-2">
                <SubscriptionsTable
                    data={subscriptions}
                    doUpload={doUpload}
                    doDownload={doDownload}
                    uploadEnabled={selectedCompanies.length === 1}
                    format={format}
                    setFormat={setFormat}
                    includeExcelStringFormat={includeExcelStringFormat}
                    setIncludeExcelStringFormat={setIncludeExcelStringFormat}
                    selectedSubscriptions={selectedSubscriptions}
                    setSelectedSubscriptions={setSelectedSubscriptions}
                />
            </div>
        </div>
    );
}

function SubscriptionsTable({
                                data,
                                doDownload,
                                doUpload,
                                uploadEnabled,
                                format,
                                setFormat,
                                includeExcelStringFormat,
                                setIncludeExcelStringFormat,
                                selectedSubscriptions,
                                setSelectedSubscriptions
                            }: {
    data: SubscriptionWithUser[],
    doDownload: () => void,
    uploadEnabled?: boolean,
    doUpload: () => void,
    format: "140A" | "standard",
    setFormat: (format: "140A" | "standard") => void,
    includeExcelStringFormat: boolean,
    setIncludeExcelStringFormat: (includeExcelStringFormat: boolean) => void,
    selectedSubscriptions: number[],
    setSelectedSubscriptions: (selectedSubscriptions: number[]) => void
}) {

    useEffect(() => {
        setSelectedSubscriptions(data.map(s => parseInt(s.subscription_id)));
    }, [data]);

    const rowCount = data.length;
    const numSelected = selectedSubscriptions.length;
    const onSelectAllClick = (checked: boolean) => {
        if (checked) {
            const newSelected = data.map((n) => parseInt(n.subscription_id));
            setSelectedSubscriptions(newSelected);
            return;
        }
        setSelectedSubscriptions([]);
    };

    const isSelected = (id: number) => selectedSubscriptions.indexOf(id) !== -1;

    const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
        const selectedIndex = selectedSubscriptions.indexOf(id);
        let newSelected: number[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(...selectedSubscriptions, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selectedSubscriptions.slice(1));
        } else if (selectedIndex === selectedSubscriptions.length - 1) {
            newSelected = newSelected.concat(selectedSubscriptions.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selectedSubscriptions.slice(0, selectedIndex),
                selectedSubscriptions.slice(selectedIndex + 1)
            );
        }

        setSelectedSubscriptions(newSelected);
    };

    return (
        <div className="flex flex-col h-full">
            <Paper className="flex-grow w-full h-full overflow-hidden">
                <div className="max-h-full">
                    <Table
                        className="min-w-full overflow-auto"
                        aria-labelledby="tableTitle"
                    >
                        <TableHeader>
                            <TableCell>
                                <Checkbox
                                    color="primary"
                                    indeterminate={numSelected > 0 && numSelected < rowCount}
                                    checked={rowCount > 0 && numSelected === rowCount}
                                    onCheckedChange={onSelectAllClick}
                                />
                            </TableCell>
                            {headCells.map((headCell) => (
                                <TableCell
                                    key={headCell.id}
                                    align={headCell.numeric ? "right" : "left"}
                                >
                                    {headCell.label}
                                </TableCell>
                            ))}
                        </TableHeader>
                        <TableBody className="overflow-auto">
                            {data.map((row, index) => {
                                const subsId = parseInt(row.subscription_id);
                                const isItemSelected = isSelected(subsId);
                                const labelId = `enhanced-table-checkbox-${index}`;

                                return (
                                    <TableRow
                                        onClick={(event) => handleClick(event, subsId)}
                                        role="checkbox"
                                        aria-checked={isItemSelected}
                                        tabIndex={-1}
                                        key={row.subscription_id}
                                        className={isItemSelected ? "bg-gray-50 dark:bg-gray-800" : ""}
                                    >
                                        <TableCell>
                                            <Checkbox color="primary" checked={isItemSelected}/>
                                        </TableCell>
                                        <TableCell scope="row">
                                            {row.id}
                                        </TableCell>
                                        <TableCell scope="row">
                                            {row.subscription_id}
                                        </TableCell>
                                        <TableCell align="right">{row.email}</TableCell>
                                        <TableCell align="right">{row.full_name}</TableCell>
                                        <TableCell align="right">{row.insurance_number}</TableCell>
                                        <TableCell align="right">{row.company_id}</TableCell>
                                        <TableCell align="left">{row.billed_at}</TableCell>
                                        <TableCell align="left">{row.bill_paid_at}</TableCell>
                                        <TableCell align="right">{row.token}</TableCell>
                                        <TableCell align="right">{row.token_alias}</TableCell>
                                        <TableCell align="right">{row.company_token_batch_name}</TableCell>
                                        <TableCell align="right">{row.company_token_batch_id}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </Paper>
            <div className="flex flex-row gap-2 p-2 items-center justify-between">
                <div>{selectedSubscriptions.length} subscriptions</div>
                <Typography variant={"label"}>Data Format</Typography>
                <RadioGroup className="flex items-center gap-2" defaultValue="standard" id="format-group"
                            onValueChange={(value) => setFormat(value as any)}>
                    <Label
                        className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-gray-100 dark:[&:has(:checked)]:bg-gray-800"
                        htmlFor="standard"
                    >
                        <RadioGroupItem id="standard" value="standard"/>
                        Standard
                    </Label>
                    <Label
                        className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-gray-100 dark:[&:has(:checked)]:bg-gray-800"
                        htmlFor="140A"
                    >
                        <RadioGroupItem id="140A" value="140A"/>
                        140A
                    </Label>
                </RadioGroup>

                <Typography variant={"label"}>Export Format</Typography>
                <RadioGroup className="flex items-center gap-2" defaultValue="standard" id="file-format-group"
                            onValueChange={(value) => setFormat(value as any)}>
                    <Label
                        className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-gray-100 dark:[&:has(:checked)]:bg-gray-800"
                        htmlFor="excel"
                    >
                        <RadioGroupItem id="excel" value="excel"/>
                        Excel
                    </Label>
                    <Label
                        className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-gray-100 dark:[&:has(:checked)]:bg-gray-800"
                        htmlFor="csv"
                    >
                        <RadioGroupItem id="csv" value="140A"/>
                        CSV
                    </Label>
                </RadioGroup>
                <div className="flex flex-col gap-1">
                    <Button disabled={selectedSubscriptions.length === 0} onClick={doDownload}>
                        {"Download locally"}
                    </Button>
                    <Button
                        variant={"text"}
                        disabled={!uploadEnabled || selectedSubscriptions.length === 0 || format !== "standard"}
                        onClick={doUpload}
                    >
                        {"Upload to backend and mark as billed"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function CompaniesTokenBatchSelect({
                                       selectedCompany,
                                       selectedTokenBatches,
                                       setSelectedTokenBatches,
                                       authToken
                                   }: {
    selectedCompany: Company | undefined,
    selectedTokenBatches: CompanyTokenBatch[],
    setSelectedTokenBatches: (tokenBatch: CompanyTokenBatch[]) => void,
    authToken?: string
}) {

    const [companyTokenBatches, setCompanyTokenBatches] = useState<CompanyTokenBatch[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!selectedCompany || !authToken) {
            setCompanyTokenBatches([]);
            return;
        }
        setLoading(true);
        setError(null);
        fetchCompanyTokenBatches(authToken, selectedCompany.id)
            .then((companyTokenBatches) => {
                setCompanyTokenBatches(companyTokenBatches);
                setLoading(false);
            })
            .catch((error) => {
                setError(error);
                setLoading(false);
            });
    }, [selectedCompany]);

    if (error) {
        return <div>{error?.message}</div>;
    }

    if (!companyTokenBatches) return null;


    return (
        <>
            <MultiSelect
                multiple={true}
                disabled={loading || companyTokenBatches.length === 0}
                label="Company batch"
                name="company_token_batch"
                value={(selectedTokenBatches ?? []).map(tb => tb.id)}
                onValueChange={(value) => {
                    const tokenBatches = value.map((id) => companyTokenBatches.find((company) => company.id === id)).filter(Boolean) as CompanyTokenBatch[];
                    setSelectedTokenBatches(tokenBatches);
                }}
            >
                {companyTokenBatches && companyTokenBatches.map((c) => (
                    <MultiSelectItem
                        key={`select-${c.id}`}
                        value={c.id}
                    >
                        {c.name}
                    </MultiSelectItem>
                ))}
            </MultiSelect>
            <Button size={"small"} variant={"outlined"} disabled={loading || !selectedCompany} onClick={() => {
                setSelectedTokenBatches(companyTokenBatches ?? []);
            }}>Select all batches</Button>
        </>
    );
}

function CompanyWidgetEntry({
                                firebaseToken,
                                company,
                                tokenBatches,
                                setCompany,
                                setCompanyTokenBatches,
                                includeRemove,
                                onRemove
                            }: {
    firebaseToken?: string,
    company?: Company,
    tokenBatches?: CompanyTokenBatch[],
    setCompany: (company: Company) => void,
    setCompanyTokenBatches: (tokenBatches: CompanyTokenBatch[]) => void,
    includeRemove?: boolean,
    onRemove?: () => void
}) {
    return (
        <Paper className="p-2 flex flex-col gap-2">
            <CompaniesSelect authToken={firebaseToken} selectedCompany={company} setSelectedCompany={setCompany}/>
            <CompaniesTokenBatchSelect
                authToken={firebaseToken}
                selectedCompany={company}
                selectedTokenBatches={tokenBatches ?? []}
                setSelectedTokenBatches={setCompanyTokenBatches}
            />
            {includeRemove && <Button variant={"text"} onClick={onRemove}>Remove</Button>}
        </Paper>
    );
}

let companiesCache: Company[] | undefined = undefined;

function CompaniesSelect({
                             selectedCompany,
                             setSelectedCompany,
                             authToken
                         }: {
    selectedCompany: Company | undefined,
    setSelectedCompany: (company: Company) => void,
    authToken?: string
}) {


    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!authToken) return;
        if (companiesCache) {
            setCompanies(companiesCache);
            return;
        }
        setLoading(true);
        setError(null);
        fetchCompanies(authToken)
            .then((companies) => {
                setCompanies(companies);
                setLoading(false);
                companiesCache = companies;
            })
            .catch((error) => {
                setError(error);
                setLoading(false);
            });
    }, [authToken]);

    if (error) {
        return <div>{error?.message}</div>;
    }

    return (
        <Select
            className={"w-full"}
            label="Company"
            name="company"
            disabled={loading || !companies}
            value={selectedCompany?.id ?? ""}
            onChange={(event) => {
                const selectedCompany = companies.find((company) => company.id === event.target.value);
                setSelectedCompany(selectedCompany!);
            }}
        >
            {companies && companies.map((c) => (
                <SelectItem
                    key={`select-${c.id}`}
                    value={c.id}
                >
                    {c.name}
                </SelectItem>
            ))}
        </Select>
    );
}

function entryToCSVRow(entry: any[]) {
    return entry
        .map((v: string | undefined) => {
            if (v === null || v === undefined) return "";
            const isString = typeof v === "string";
            const  parsed: string = String(v);
            return "\"" + parsed.replaceAll("\"", "\"\"") + "\"";
        })
        .join(";") + "\r\n";
}

export function downloadBlob(content: BlobPart[], filename: string, contentType: string) {
    const blob = new Blob(content, { type: contentType });
    const url = URL.createObjectURL(blob);
    const pom = document.createElement("a");
    pom.href = url;
    pom.setAttribute("download", filename);
    pom.click();
}

function differenceInYears(date1: Date, date2: Date) {
    const diff = Math.abs(date1.getTime() - date2.getTime());
    return Math.floor(diff / (1000 * 3600 * 24 * 365));
}

function formatDate(date?: Date) {
    if (date) return `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${("0" + date.getDate()).slice(-2)}`;
    else return "";
}

function create140AEntriesFrom(invoiceWithUser: SubscriptionWithUser) {
    const birthDate = invoiceWithUser.birthdate ? new Date(invoiceWithUser.birthdate) : undefined;
    const age = birthDate ? differenceInYears(new Date(), birthDate) : -1;
    const nameParts = invoiceWithUser.full_name?.split(" ") ?? [];
    const name = nameParts.length > 1 ? nameParts[0] : "";
    const surname = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
    return [
        [
            invoiceWithUser.id, // "ReferenzID", // User ID
            "KOP", // "Satzart", // KOP | POS
            "104027544", // "IVK_IKEmpfaenger",
            "660511111", // "IVK_IKSender",
            "10", // "IVK_VerarbeitungsKZ",
            "330922595", // "IBL_IKLeistungserbringer",
            "", // "Hauptabrechnungszeitraum"
            invoiceWithUser.contract_number_140a, // "INF_VertragsKZ",
            "0", // "INF_ArtAnspruch",
            formatDate(birthDate).replaceAll("-", ""), // "INV_GebDatum",
            invoiceWithUser.insurance_number, // "INV_Nummer",
            invoiceWithUser.insurance_id_140a, // "INV_IKKrankenKasse",
            surname, // "INV_Name",
            name, // "INV_Vorname",
            "", // "INV_GueltigkeitKarte",
            age <= 67 ? 1 : 5, // "INV_VersichertenArt",
            "0", // "INV_Personengruppe",
            "0", // "INV_DMPKennzeichen",
            invoiceWithUser.gender === "female" ? 1 : 2, // "INV_Geschlecht",
            "", // "INV_Freigabe",
            "", // "INV_FreigabeBeginn",
            "", // "INV_FreigabeEnde",
            "", // "RGI_EinzelBisDatum",
            "", // "RGI_EinzelVonDatum",
            "", // "RGI_EinzelIKRechnungsteller",
            "", // "RGI_EinzelIKZahlungsempfaenger",
            "", // "RGI_EinzelInfoRechnung",
            "", // "RGI_EinzelRechNummer",
            "", // "ABR_Anzahl",
            "", // "ABR_Begruendung",
            "", // "ABR_Sachkosten",
            "", // "ABR_Sachkostenbezeichnung",
            "", // "ABR_DatumLeistung",
            "", // "ABR_GebNr",
            "", // "ABR_WertGebNr",
            "", // "GebIDIntern",
            "" // "DIA_ICDSchluessel"
        ],
        [
            invoiceWithUser.id, // "ReferenzID", // User ID
            "POS", // "Satzart", // KOP | POS
            "", // "IVK_IKEmpfaenger",
            "", // "IVK_IKSender",
            "", // "IVK_VerarbeitungsKZ",
            "", // "IBL_IKLeistungserbringer",
            "", // "Hauptabrechnungszeitraum"
            "", // "INF_VertragsKZ",
            "", // "INF_ArtAnspruch",
            "", // "INV_GebDatum",
            "", // "INV_Nummer",
            "", // "INV_IKKrankenKasse",
            "", // "INV_Name",
            "", // "INV_Vorname",
            "", // "INV_GueltigkeitKarte",
            "", // "INV_VersichertenArt",
            "", // "INV_Personengruppe",
            "", // "INV_DMPKennzeichen",
            "", // "INV_Geschlecht",
            "", // "INV_Freigabe",
            "", // "INV_FreigabeBeginn",
            "", // "INV_FreigabeEnde",
            "", // "RGI_EinzelBisDatum",
            "", // "RGI_EinzelVonDatum",
            "", // "RGI_EinzelIKRechnungsteller",
            "", // "RGI_EinzelIKZahlungsempfaenger",
            "", // "RGI_EinzelInfoRechnung",
            "", // "RGI_EinzelRechNummer",
            "1", // "ABR_Anzahl",
            "", // "ABR_Begruendung",
            "", // "ABR_Sachkosten",
            "", // "ABR_Sachkostenbezeichnung",
            formatDate(new Date(invoiceWithUser.registration_date)).replaceAll("-", ""), // "ABR_DatumLeistung",
            "GWQMEDMO1", // "ABR_GebNr",
            "143,5", // "ABR_WertGebNr",
            "GWQMEDMO1", // "GebIDIntern",
            "" // "DIA_ICDSchluessel"
        ]
    ];
}

function createStandardEntriesFrom(invoiceWithUser: SubscriptionWithUser, includeExcelStringFormat = true) {
    return [
        [
            invoiceWithUser.id,
            formatDate(invoiceWithUser.registration_date ? new Date(invoiceWithUser.registration_date) : undefined),
            formatDate(invoiceWithUser.billing_interaction ? new Date(invoiceWithUser.billing_interaction) : undefined),
            formatDate(invoiceWithUser.subscription_end_date ? new Date(invoiceWithUser.subscription_end_date) : undefined),
            invoiceWithUser.total_interactions,
            invoiceWithUser.email,
            formatDate(invoiceWithUser.birthdate ? new Date(invoiceWithUser.birthdate) : undefined),
            includeExcelStringFormat ? escapeExcelString(invoiceWithUser.insurance_number) : invoiceWithUser.insurance_number,
            invoiceWithUser.full_name,
            invoiceWithUser.company_name,
            invoiceWithUser.token,
            invoiceWithUser.token_alias,
            invoiceWithUser.company_token_batch_name,
            invoiceWithUser.company_token_batch_id,
        ]
    ];
}

function escapeExcelString(value: string) {
    return '="' + value + '"';
}

const headCells = [
    { id: "id", numeric: false, disablePadding: true, label: "User Id" },
    { id: "subscription_id", numeric: false, disablePadding: true, label: "Subscription Id" },
    { id: "email", numeric: true, disablePadding: false, label: "Email" },
    { id: "name", numeric: true, disablePadding: false, label: "Name" },
    { id: "insurance_number", numeric: true, disablePadding: false, label: "Insurance #" },
    { id: "company_id", numeric: true, disablePadding: false, label: "Company Id" },
    { id: "billed_at", numeric: false, disablePadding: false, label: "Billed at" },
    { id: "bill_paid_at", numeric: false, disablePadding: false, label: "Payed at" },
    { id: "token", numeric: true, disablePadding: false, label: "Token" },
    { id: "token_alias", numeric: true, disablePadding: false, label: "Token alias" },
    { id: "company_token_batch_name", numeric: true, disablePadding: false, label: "Company token batch name" },
    { id: "company_token_batch_id", numeric: true, disablePadding: false, label: "Company token batch id" }
];

function getCSV(data: SubscriptionWithUser[], selectedSubscriptions: number[], format: "140A" | "standard", includeExcelStringFormat: boolean) {
    const selectedData = data.filter(invoiceWithUser => selectedSubscriptions.includes(parseInt(invoiceWithUser.subscription_id)));
    const BOM = "\uFEFF";
    if (format === "140A") {
        const downloadData = selectedData.flatMap((invoiceWithUser) => create140AEntriesFrom(invoiceWithUser));
        return [BOM, entryToCSVRow(fields_140a), ...downloadData.map((e) => entryToCSVRow(e))];
    } else if (format === "standard") {
        const downloadData = selectedData.flatMap((invoiceWithUser) => createStandardEntriesFrom(invoiceWithUser, includeExcelStringFormat));
        return [BOM, entryToCSVRow(fieldsStandard), ...downloadData.map((e) => entryToCSVRow(e))];
    } else {
        throw Error("Unknown format");
    }
}
