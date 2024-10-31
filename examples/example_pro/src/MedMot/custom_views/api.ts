import { format } from "date-fns";

export type User = {
    id: number;
    email: number;
    full_name: string;
    birthdate: string;
    insurance_number: string;
}

export type Subscription = {
    token: string;
    token_alias: string;
    billing_interaction: string;
    subscription_end_date: string;
    company_id: string;
    company_token_batch_id: number;
    company_token_batch_name: number;
    company_token_id: number;
    subscription_id: string;
    invoice_id: string;
    id: string; // user_id
    registration_date: string;
    total_interactions: number;
    gender: "female" | "male",
    age: number,
    billed: boolean, // is it in an invoice
    billed_at: string, // when was it billed
    bill_paid: boolean, // is the invoice paid
    bill_paid_at: string, // when was the invoice paid
}

export type Company = {
    id: string;
    name: string;
    insurance_id_140a: string;
    contract_number_140a: string;
}

export type CompanyTokenBatch = {
    id: string;
    name: string;
    insurance_id_140a: string;
}

const ENDPOINT = import.meta.env.VITE_API;
const USERS_ENDPOINT = import.meta.env.VITE_USERS_API;

export function fetchCompanies(authToken: string): Promise<Company[]> {
    return fetch(ENDPOINT + "/v2/billing/companies", {
        headers: {
            "Authorization": `Bearer ${authToken}`
        }
    })
        .then(response => response.json())
        .then(data => data.companies);
}

export function fetchCompanyTokenBatches(authToken: string, company_id: string): Promise<CompanyTokenBatch[]> {
    return fetch(ENDPOINT + `/v2/billing/companies/${company_id}/company_token_batches`,
        {
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        })
        .then(response => response.json())
        .then(data => data.company_token_batches);
}

export function fetchSubscriptions(authToken: string, company: string, startDate: Date, endDate: Date, onlyBilled: boolean, onlyNonBilled: boolean, companyTokenBatches: string[], minCompletedInteractions: number | null): Promise<Subscription[]> {
    const from = format(startDate, "yyyy-MM-dd");
    const to = format(endDate, "yyyy-MM-dd");

    let path = `/v2/billing/report?company=${company}&from=${from}&to=${to}&only_non_billed=${onlyNonBilled}&only_billed=${onlyBilled}`;
    if (companyTokenBatches) {
        path += `&company_token_batch=${companyTokenBatches.join(",")}`;
    }
    if (minCompletedInteractions != null) {
        path += `&min_completed_interactions=${minCompletedInteractions}`;
    }
    return fetch(ENDPOINT + path,
        {
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        })
        .then((response) => response.json())
        .then((data) => data.customers);

}

export function fetchUsers(authToken: string, userIds: number[]): Promise<User[]> {
    return fetch(USERS_ENDPOINT + `/users`,
        {
            method: "POST",
            body: JSON.stringify({ users: userIds }),
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log("data", userIds, data);
            return data.users;
        });
}

export function uploadInvoice(authToken: string, content: BlobPart[], filename: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", new Blob(content, { type: "text/csv; charset=utf-8" }), filename);

    return fetch(USERS_ENDPOINT + `/billing/upload`,
        {
            method: "POST",
            body: formData,
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            return data.file;
        });
}

export function postInvoice(authToken: string, subscriptionIds: number[], storageReference: string, company: string): Promise<Subscription[]> {
    console.log("postInvoice", subscriptionIds, storageReference, company);
    return fetch(ENDPOINT + `/v2/billing/report/bill?company=${company}`,
        {
            method: "POST",
            body: JSON.stringify({
                subscription_ids: subscriptionIds,
                storage_reference: storageReference
            }),
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log("postInvoice", subscriptionIds, data);
            if (data.message)
                throw new Error(data.message);
            return data.customers;
        });
}
